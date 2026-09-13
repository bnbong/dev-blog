---
title: '[알고리즘 리뷰] 다익스트라'
description: 다익스트라 알고리즘 팁 및 예시 문제
authors:
- bnbong
date:
  created: 2026-09-13
  updated: 2026-09-13
categories:
- Algorithms
tags:
- programming
- coding test
comments: true
---

??? note "Series: 알고리즘 리뷰"

    [0. Introduction](20250128.md)

    [1. 구현](20260825.md)

    [2. DFS / BFS](20260828.md)

    [3. 정렬](20260830.md)

    [4. 이분 탐색 & 이분 탐색 트리](20260902.md)

    [5. 다익스트라](20260913.md)

나동빈님의 '이것이 취업을 위한 코딩 테스트다 with 파이썬' 책을 바탕으로 정리한 내용이 포함되어 있습니다.

## 0. 최단 경로 최강자 BFS (이제는 범부)

경로 문제… 그래프…어? ‘최단’ 키워드라면 ⇒ BFS 였음.

BFS 만능 아니었나? → 아님

BFS로 최단 경로를 보장 받는 경우는 숨은 전제가 존재:

> 모든 간선의 비용이 같을 때만 BFS가 최강

### 경로(간선)에 비용이 추가되면?

```
1 --- (5) --- 3
|             |
(2)           (1)
|             |
2 -------------

// 괄호 안 숫자가 비용
```

1에서 3으로 가는 경로 ⇒ 총 2가지

1. 1에서 3으로 직행 : 비용 5
2. 1에서 2를 거치고 3으로 : 비용 2+1 = 3   ← 이게 더 저렴하게 감

만약 위 상황에 BFS를 적용한다면 간선 숫자만 세는 BFS는 더 짧은 건너간 횟수의 1번 경로를 선택함

## 1. 다익스트라

> 누적 비용이 작은 경로를 찾는 알고리즘

### BFS vs 다익스트라 간단 비교

|  | BFS | 다익스트라 |
| --- | --- | --- |
| 간선 비용 | 동일 | 다름 |
| 자료 구조 | `deque` (큐) | `heapq` (우선순위 큐) |
| 꺼내는 순서 | 넣은 순서 | 누적 비용이 가장 작은거 |

책에서 설명하는 다익스트라는 내용이 좀 길어서 이해에 오래걸리는데…

실은 **자료구조를 큐에서 우선순위 큐로 바꾼게 전부**인듯? ( + 거리 테이블 도입)

### 동작 원리

> 갈 수 있는 선택지 중 비용이 가장 작은 것 선택해 가는 것 반복 ⇒ 최단 거리 

왜? 선택한 노드의 비용(혹은 거리)가 `d` 일때, 해당 노드를 다른 길로 돌아서 오려면 무조건 `d` 보다 큰 비용을 들여서 와야함. 즉, `d` 보다 작은 비용으로 그 노드에 갈 수 없음.

즉, 그냥 저렴한거 선택하면서 가면 됨

이걸 코드로 풀면 :

```python
"""
다익스트라 알고리즘 skeleton

# 1. 출발 노드의 거리를 0, 나머지는 무한대로 초기화
# 2. 거리 테이블 선언
# 3. 우선순위 큐를 선언
# 4. 우선순위 큐에서 거리가 가장 작은 노드를 꺼냄
    # 4-1. 이미 처리된 노드는 무시
# 5. 그 노드에 인접한 노드들 확인
    # 5-1. 더 짧은 경로가 있다면,
        # 5-1-1. 거리 테이블 갱신
        # 5-1-2. 큐에 삽입
"""
import heapq
from typing import List, Dict, TypeVar, Tuple, Union

T = TypeVar('T')        # 제네릭 타입(그래프가 무슨 타입으로 올지 몰라서 그냥 씀)
INF = int(1e9)          # 책에서 사용한 무한대 표현

def dijkstra(graph: Union[List[T], Dict[T, Dict[T, int]]], start: T) -> Dict:
    """다익스트라 스켈레톤 코드

    :param graph: 다익스트라를 적용시킬 그래프 (다형성을 고려하였으며, 하단의 그래프 예시는 Dict로 받기 위해 더 명시적으로 씀)
    :param start: 출발 노드 (T)
    :return: 거리 테이블 (Dict[T, float])
    """
    # 2. 거리 테이블 선언
    distances: Dict[T, int] = {node: INF for node in graph}
    # 1. 출발 노드의 거리를 0, 나머지는 무한대로 초기화
    distances[start] = 0
    # 3. 우선순위 큐를 선언
    priority_queue: List[Tuple[int, T]] = [(0, start)]

    while priority_queue:
        # 4. 우선순위 큐에서 거리가 가장 작은 노드를 꺼냄
        current_distance, current_node = heapq.heappop(priority_queue)

        # 4-1. 이미 처리된 노드는 무시
        if current_distance > distances[current_node]:
            continue

        # 5. 그 노드에 인접한 노드들 확인
        for neighbor, biyoung in graph[current_node].items():   # 만약 그래프가 리스트로 온다면 graph[current_node] 만.
            _distance = current_distance + biyoung

            # 5-1. 더 짧은 경로가 있다면 거리 테이블 갱신
            if _distance < distances[neighbor]:
                # 5-1-1. 거리 테이블 갱신
                distances[neighbor] = _distance
                # 5-1-2. 큐에 삽입
                heapq.heappush(priority_queue, (_distance, neighbor))

    return distances

if __name__ == "__main__":
    graph = {
        'A': {'B': 8, 'C': 1, 'D': 2},
        'B': {},
        'C': {'B': 5, 'D': 2},
        'D': {'E': 3},
        'E': {'1': 1},
        '1': {}
    }
    
    # A를 출발점으로한 모든 노드 까지의 최단 거리 테이블
    # 도달할 수 없는 노드는 INF로 표시되는데 예시는 A가 모두 방문 가능해서 안나옴.
    print(dijkstra(graph, 'A'))

```

결과:

```
{'A': 0, 'B': 6, 'C': 1, 'D': 2, 'E': 5, '1': 6}
```

이렇게 해서 특정 노드에서 다른 노드들로 가는 최단 거리 테이블을 뽑아 낼 수 있음.

위 스켈레톤 코드에서 `if current_distance > distances[current_node]` 이 부분이 중요한데, 같은 노드가 큐에 여러 번 들어가기 때문에 이미 갱신된 노드들을 또 계산하는 참사를 막기 위해 꼭 필요한 continue 구문임(클로드 교수한테 저 부분 빼서 실측 비교 부탁했더니 위 부분이 있어야 1.9배 정도 효율적이게 됐음).

### 왜 Priority Queue일까

pq를 안써도 구현은 가능하지만 효율성이 다름

책에서 설명하기로는

- 단순 선형 탐색 시간 복잡도 = $O(V^2)$ ⇒ 매번 전체를 훑어 최소 거리 노드를 찾아야하는 cost
- 우선순위 큐 = $O(E log V)$ ⇒ heapq가 알아서 최소를 꺼내줌

## 2. 다익스트라는 무적인가?

> 아님

다익스트라를 쓸 수 있는 환경은 **간선의 비용이 음수가 아닌 경우**에서만 쓸 수 있음.

**그래프:** `1→2(1)`, `1→3(2)`, `3→2(-5)`, `2→4(1)`**실제 최단 (1→4):** `1→3→2→4` = 2 - 5 + 1 = **-2**

---

## 3. 변종

### 1. 경로 복원

거리가 아닌 건너온 경로들을 물으면? ⇒ 경로를 기록하도록 구현

```python
parent: List[int] = [0] * (n+1)

# ~~~ 무슨무슨 알고리즘 구현 + 다익스트라 ~~~

# 갱신할 때
parent[neighbor] = current_node

# 역추적
path: List = []
curr = target

while curr:
		path.append(curr)
		curr = parent[curr]

# 뒤집어줘서 시작점에서 건너온 경로를 출력하게...
path.reverse()
```

### 2. 도달 불가 처리

경로 distances의 요소가 INF이면 “INFINITY” 같은거 출력하던지 뭐에 저장하던지…

### 3. 양방향 그래프

```python
graph[a].append((b, c))
graph[b].append((a, c))  # 무방향인 경우 이걸 추가해야함.
```

단방향 양방향 그래프인지 문제에서 잘 읽고 판단할 것.

### 4. 출발점이 여러개라면?

각 출발점에서 다익스트라를 돌리거나 코드를 고치거나…

여러개의 출발점을 큐에 때려 넣고 다익스트라를 한 번만 돌려서 하는 코드가 돌아다니는 것 같은데 이건 이해를 잘 못하겠음ㅠ

---

다익스트라부터 머리가 아파오기 시작하는데... 추후 포스팅할 벨만-포드 알고리즘, 플로이드-워셜 알고리즘, A* 알고리즘은 배우고 있는 중인데 머리가 터지는 중