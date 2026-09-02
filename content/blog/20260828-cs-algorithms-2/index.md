---
title: '[알고리즘 리뷰] DFS / BFS'
description: DFS / BFS 리뷰 및 예시 문제
authors:
- bnbong
date:
  created: 2026-08-28
  updated: 2026-08-28
categories:
- Algorithms
tags:
- programming
- implementation
- coding test
comments: true
---

??? note "Series: 알고리즘 리뷰"

    [0. Introduction](20250128.md)

    [1. 구현](20260825.md)

    [2. DFS / BFS](20260828.md)

    [3. 정렬](20260830.md)

    [4. 이분 탐색 & 이분 탐색 트리](20260902.md)

나동빈님의 '이것이 취업을 위한 코딩 테스트다 with 파이썬' 책을 바탕으로 정리한 내용이 포함되어 있습니다.

## 자료구조들

| 이름 | 구조 | 모듈 (python 에서) |
| --- | --- | --- |
| stack | FILO | built-in 기능 list로 구현 가능 (`append()`, `pop()`) |
| queue | FIFO | `from collection import deque` |

## 재귀 구현

### 한도 설정 (하면 좋음, 하단에 관련 내용 후술)

```python
import sys
sys.setrecursionlimit(10**6)
```

## 그래프 탐색 구현 관련 기본

### 노드와 간선

- **노드** : 정점, 거쳐야하는 목표
- **간선** : 노드를 연결하는 도로

### 코드 구현 방식

```python
class Node:    # Node class 선언 (이해를 위해 C 언어의 typedef 처럼 구현)
		def __init__(self, name):
				self.name = name          # 노드 이름 (데이터)
				self.neighbors = []       # 연결된 간선 (이웃 노드들)
				

class Graph:   # 메인 그래프
		def __init__(self):
				self.nodes = {}
		
		def add_node(self, name):               # 노드를 추가하는 함수
				if name not in self.nodes:          # 노드가 없으면 그래프에 해당 노드 추가
						self.nodes[name] = Node(name)
		
		def add_edge(self, u_name, v_name):
				# 노드가 없으면 생성하기
				self.add_node(u_name)
				self.add_node(v_name)
				
				# 양방향 간선 추가 (방향이 없는 무방향 그래프 상정)
				self.nodes[u_name].neighbors.append(self.nodes[v_name])
				self.nodes[v_name].neighbors.append(self.nodes[u_name])
				

# 사용 예시
g = Graph()
g.add_edge('A', 'B')   # {'A': <Node object at 주소1>, 'B': <Node object at 주소2>}
g.add_edge('A', 'C')   # {'A': <Node object at 주소1>, 'B': <Node object at 주소2>, 'C': <Node object at 주소3>}
```

더 간단하게 python 느낌으로 구현하면…

```python
class GraphDict:
		def __init__(self):
				self.graph = {}             # Python 해시 맵 사용
		
		def add_node(self, node):       # 노드를 추가하는 함수
				if node not in self.graph:  # 노드가 없으면 노드 추가
						self.graph[node] = []
		
		def add_edge(self, u, v):
		    # 노드가 없으면 생성하기
				self.add_node(u)
				self.add_node(v)
				
				# 간선 추가
				self.graph[u].append(v)
				self.graph[v].append(u)     # 무방향 그래프일 때
				
				
# 사용 예시
g = GraphDict()
g.add_edge('A', 'B')
g.add_edge('A', 'C')
print(g.graph)   # {'A': ['B', 'C'], 'B': ['A'], 'C': ['A']}  매우 직관적.
```

이런식으로 노드와 노드가 연결된 그래프가 주어질 때,

갈 수 있는 도로(간선)중에서 

- 가장 깊이 갈 수 있는 경로를 찾는 것 ⇒ **DFS(Depth-First-Search)**
- 가까이 인접한 경로부터 찾는 것 ⇒ **BFS(Breadth-First-Search)**

## DFS/BFS

### DFS (Depth-First-Search)

> 깊이-우선-탐색
> 
- 갈 수 있는 데까지 가고, 막히면 돌아옴
- 스택 혹은 재귀 방식으로 구현
- 연결 여부, **모든 경로 탐색**, **백트래킹** 등에서 사용
- 덩어리가 몇 개인가, 연결되어 있는가 ⇒ DFS

예제 코드

```python
# 재귀 방식 구현
def dfs(graph: list, v: int, visited:list):
		# 현재 탐색하는 노드를 '방문' 처리
		visited[v] = True
		print(v, end=' ')
		
		# 현재 노드와 연결된 다른 노드를 재귀적으로 방문
		for i in graph[v]:
				if not visited[i]:   # 방문한 적 없다면
						dfs(graph, i, visited)   # 재귀적으로 노드들을 방문 처리
						

# 책의 예제 노드 그래프 형태, 그래프 모양은 문제에 따라 적절히 구성할 것.
graph = [
		[],        # 0번 노드는 빈 리스트로 처리
		[2, 3, 8],
		[1, 7],
		[1, 4, 5],
		[3, 5],
		[3, 4],
		[7],
		[2, 6, 8],
		[1, 7]
]

# 방문 정보를 담는 리스트
visited = [False] * 9

# DFS 실행 (1번 노드부터 탐색한다고 하면)
dfs(graph, 1, visited)

# output : 1 2 7 6 8 3 4 5
```

### BFS (Breadth-First-Search)

> 너비-우선-탐색
> 
- 가까운 것부터 층층이 퍼짐
- 큐(`deque`) 방식으로 구현
- **최단 거리**, 최소 횟수 등에서 사용
- ‘최소’, ‘최단’ 몇 번 만에’ ⇒ BFS

예제 코드

```python
from collections import deque

def bfs(start):
		q = deque([start])
		visited[start] = True           # 현재 탐색하는 노드를 '방문' 처리
		
		while q:
				v = q.popleft()
				print(v, end=' ')
				for i in graph[v]:
						if not visited[i]:
								visited[i] = True   # 큐에 넣을 때 방문 처리
								q.append(i)

# 책의 예제 노드 그래프 형태, 그래프 모양은 문제에 따라 적절히 구성할 것.
graph = [
		[],        # 0번 노드는 빈 리스트로 처리
		[2, 3, 8],
		[1, 7],
		[1, 4, 5],
		[3, 5],
		[3, 4],
		[7],
		[2, 6, 8],
		[1, 7]
]

# 방문 정보를 담는 리스트
visited = [False] * 9

# BFS 실행 (1번 노드부터 탐색한다고 하면)
bfs(1)

# output : 1 2 3 8 7 4 5 6 
```

### 재귀를 실 상황에서 사용한다면 과연 문제는 없을까

`sys.setrecursionlimit(10**6)`라고 설정되어 있다고 할 때, 과연 1,000 x 1,000 격자를 전부 탐색하는 방식의 효율성은 어느정도일까

| 방식 | 시간 (대략) |
| --- | --- |
| 재귀 DFS | 1.03초 |
| 스택 DFS | 0.61초 |
| BFS (deque 방식) | 0.61초 |
- 실험한 코드
    
    ```python
    # 길어질 것 같아서 클로드한테 구현 시킴
    import sys
    import time
    from collections import deque
    
    N = 1000
    DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))  # 좌 상 하 우
    
    def make_board():
        """전부 0(= 갈 수 있는 칸)인 N x N 격자. 최악의 경우를 만들기 위함."""
        return [[0] * N for _ in range(N)]
        
    # ---------- 1) 재귀 DFS ----------
    def run_recursive_dfs():
        board = make_board()
     
        def dfs(r, c):
            if not (0 <= r < N and 0 <= c < N) or board[r][c] != 0:
                return
            board[r][c] = 1                    # 방문 처리
            for dr, dc in DIRECTIONS:
                dfs(r + dr, c + dc)
     
        dfs(0, 0)
        return board
    
    # ---------- 2) 스택 DFS ----------
    def run_stack_dfs():
        board = make_board()
        stack = [(0, 0)]
        board[0][0] = 1
     
        while stack:
            r, c = stack.pop()                 # pop() → 스택
            for dr, dc in DIRECTIONS:
                nr, nc = r + dr, c + dc
                if 0 <= nr < N and 0 <= nc < N and board[nr][nc] == 0:
                    board[nr][nc] = 1          # 넣을 때 방문 처리
                    stack.append((nr, nc))
        return board
    
    # ---------- 3) BFS ----------
    def run_bfs():
        board = make_board()
        q = deque([(0, 0)])
        board[0][0] = 1
     
        while q:
            r, c = q.popleft()                 # popleft() → 큐
            for dr, dc in DIRECTIONS:
                nr, nc = r + dr, c + dc
                if 0 <= nr < N and 0 <= nc < N and board[nr][nc] == 0:
                    board[nr][nc] = 1
                    q.append((nr, nc))
        return board
        
    def measure(label, fn):
        """실행 시간을 재고, 100만 칸을 모두 방문했는지 검증한다."""
        start = time.perf_counter()
        try:
            board = fn()
        except RecursionError:
            print(f"  {label:<10} ❌ RecursionError (재귀 한도 초과)")
            return None
        elapsed = time.perf_counter() - start
        visited = sum(row.count(1) for row in board)
        print(f"  {label:<10} {elapsed:6.2f}초   (방문 {visited:,}칸)")
        return elapsed
     
     
    if __name__ == "__main__":
        print(f"Python {sys.version.split()[0]} / 격자 {N}x{N} = {N*N:,}칸\n")
     
        # --- 실험 1: 한도를 딱 10**6으로 두면? ---
        print("[실험 1] sys.setrecursionlimit(10**6)")
        sys.setrecursionlimit(10 ** 6)
        measure("재귀 DFS", run_recursive_dfs)
     
        # --- 실험 2: 한도를 넉넉히 올리면? ---
        print("\n[실험 2] sys.setrecursionlimit(1_100_000)")
        sys.setrecursionlimit(1_100_000)
        t_rec = measure("재귀 DFS", run_recursive_dfs)
        t_stk = measure("스택 DFS", run_stack_dfs)
        t_bfs = measure("BFS", run_bfs)
     
        if t_rec and t_stk:
            print(f"\n→ 재귀 DFS는 스택 DFS보다 약 {t_rec / t_stk:.1f}배 느림")
    ```
    

⇒ 재귀 방식이 약 1.7배 느림. 이유는 함수 호출 오버헤드 때문.

> 재귀 깊이가 깊으면 Python이 segmentation fault로 죽는다고 알려져 있는데, 이는 Python 3.10 버전까지의 이야기이며, Python 3.11 버전에서는 함수 간 호출이 C 스택을 쓰지 않도록 바뀌어서 완화되었습니다.
그런데 보편적인 온라인 Judge 환경에서는 최신 Python 환경을 쓰는 경우는 잘 없는 것 같으므로 여전히 무지성 재귀 호출은 한 번 더 고민해볼 필요가 있습니다.
> 

**즉, 재귀 호출 깊이가 10만이 넘어가는 상황이라면 재귀를 쓰지 말아야한다.**

### DFS를 재귀 대신 반복문으로 낋인다면?

```python
# 반복문 DFS - 재귀와 방문 순서만 다르고 결과는 같음
stack = [(sr, sc)]
visited[sr][sc] = True

DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))

while stack:
		r, c = stack.pop()           # pop() - 스택 방식 / popleft() - 큐 방식
		for dr, dc in DIRECTIONS:
				... # 머시기 머시기 구현(nr = x + dr 이랑 탐색 가능한 범위인지 체크하는 코드가 있을 듯)
				stack.append((nr, nc))

```

`stack.pop()`을 `q.popleft()`로 바꾸면 그대로 BFS로 바꿀 수 있다. 

⇒ DFS와 BFS의 분기는 사실상 이 한 줄이라고 생각하면 됨.

### deque.popleft()와 list.pop(0)은 사실상 같은 일을 하는데 뭔 차이?

| 10만회 기준 | 시간 |
| --- | --- |
| `deque.popleft()` | 약 0.005초 |
| `list.pop(0)` | 약 0.77초 |
- 실험한 코드
    
    ```python
    import tiem
    from collections import deque
    
    N = 100000 # 10만회
    
    # popleft()
    t = time.time()
    q = deque(range(N))
    while q:
    		q.popleft()
    print('popleft():', round(time.time() - t, 4))  # 소수점 아래 4째 자리에서 반올림
    
    # pop(0)
    t = time.time()
    q = liist(range(N))
    while q:
    		q.pop(0)
    print('pop(0):', round(time.time() - t, 4))     # 소수점 아래 4째 자리에서 반올림
    ```
    

`deque.popleft()` 방식이 100배 이상 효율적. `list.pop(0)`은 맨 앞을 뺀 뒤 나머지를 전부 한 칸씩 당기는 내부 동작 로직이 존재함. → 시간 복잡도 매번 O(N) | 즉, BFS에서 list를 쓰면 사고남

⇒ 큐는 가능하다면 반드시 deque를 사용하자

---

## 예제 문제

### 음료수 얼려 먹기

N*M 크기 input, 구멍이 있으면 0 / 칸막이는 1, 구멍이 있는 부분끼리 상하좌우로 연결됐다고 할 때 뚫려있는 얼음틀에서 만들어질 수 있는 아이스크림 개수 구하기

델타좌표 dx, dy를 구하고 dfs나 bfs 호출 후 끝에 도달하면 카운트 1 추가, 최종 합산이 답, 중복 탐색을 막기 위해 탐색한 부분을 1로 채워도 될 듯

#### 풀이

```python
import sys
from collections import deque

input = sys.stdin.readline

n, m = map(int, input().split())
board = [list(map(int, input().strip())) for _ in range(n)]

DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))  # 좌 상 하 우

def count_ice(sr, sc):
		q = deque([(sr, sc)])
		board[sr][sc] = 1        # 중복 탐색을 막기 위해 한번 탐색한 부분은 1로 덮어씀
		while q:
				r, c = q.popleft()           # BFS
				for dr, dc in DIRECTIONS:
						nr, nc = r + dr, c + dc
						# 갈 수 있는 방향이고, 방문한 적 없는 칸인 경우만
						if 0 <= nr < n and 0 <= nc < m and board[nr][nc] == 0:
								board[nr][nc] = 1    # 역시나 중복 탐색을 막기 위해 1로 덮어씀
								q.append((nr, nc))

count = 0
for i in range(n):
		for j in range(m):
				if board[i][j] == 0:    # board에서 구멍이 있는 칸 찾아
						count_ice(i, j)     # BFS 호출
						count += 1          # 그 구역 탐색을 모두 끝내면 +1
						
print(count)
```

### 미로 탈출

N*M 크기 input, 0은 못가고 1은 갈 수 있는 통로. (1,1)에서 (N,M)까지 최소 이동 칸 수. 시작 및 도착 칸 포함

최소 칸의 개수이니까 BFS일듯?

BFS로 칸 밟으면서 여기까지 오는데 몇 칸인지 기록 → 어떤 칸에 처음 도달했을 때가 최단거리? → 같은 메커니즘으로 도착 칸에 기록된 값이 최단 탈출 경로, 즉 답일듯

#### 풀이

```python
import sys
from collections import deque

input = sys.stdin.readline

n, m = map(int, input().split())
maze = [list(map(int, input().strip())) for _ in range(n)]

DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))  # 좌 상 하 우

dist = [[0] * m for _ in range(n)]     # 0 = 아직 방문 안 함
dist[0][0] = 1                         # 시작 칸도 1칸으로 센다

q = deque([(0,0)])

while q:
		r, c = q.popleft()           # BFS
		for dr, dc = in DIRECTIONS:
				nr, nc = r + dr, c + dc
				# 갈 수 있는 방향이고, 갈 수 있는 칸이며, 방문한 적 없는 칸인 경우만 
				if 0 <= nr < n and 0 <= nc < m and maze[nr][nc] == 1 and dist[nr][nc] == 0:
						dist[nr][nc] = dist[r][c] + 1  # 여기까지 오는데 몇 칸 걸렸는지 기록
						q.append((nr, nc))

print(dict[n-1][m-1])
```