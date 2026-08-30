---
title: '[알고리즘 리뷰] 구현'
description: 구현 알고리즘 팁 및 예시 문제
authors:
- bnbong
date:
  created: 2026-08-25
  updated: 2026-08-25
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

나동빈님의 '이것이 취업을 위한 코딩 테스트다 with 파이썬' 책을 바탕으로 정리한 내용이 포함되어 있습니다.

## 구현 관련 팁

### 기능 단위로 함수 쪼개기

구현이 길어지면 디버깅 용이성을 위해 기능 단위로 함수를 쪼개는 것이 좋습니다.

```python
def hamsu(param):
		pass  # pass로 body 구현 전 미리 구조 잡아놓기

def in_range(r, c):
		return 0 <= r < N and 0 <= c < M

def rotate(grid):
		return [list(row) for row in zip(*grid[::-1])]

def move(r, c, d):
		return r + DR[d], c + DC[d]

def simulate():
		while True:
				...
```

기능 쪼개기가 필수는 아니며, 절차가 짧고 선형구조라면 쪼개지 않는게 낫습니다.

Clean Code 책에서 소개하는 것처럼 잘게 쪼개다 보면 배보다 배꼽이 배는 커지는 경우가 생깁니다 ⇒ 판단은 알아서...

### input() 대신 효율성을 챙길 수 있는 sys.stdin.readline()

| 방법 | 20만줄 기준 성능 |
| --- | --- |
| `input()` | 0.098초 |
| `sys.stdin.readline()` | 0.017초 (약 6배) |

```python
import sys
input = sys.stdin.readline
```

단, readline 방식은 개행 문자를 포함합니다.

```python
n = int(input())                      # 숫자는 int()가 알아서 처리
a, b = map(int, input().split())      # split()이 처리
s = input().rstrip()                  # 주의 : 문자열은 반드시 rstrip() 할 것.
```

입력이 많은 경우, `readline` 대신 `read` 사용하는 것이 좋습니다.

```python
data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:]))
```

### 출력 관련

```python
for x in result:
		print(x)

# 위 대신

print('\n'.join(map(str, result)))

# 출력이 매우 많은 경우
sys.stdout.write('\n'.join(map(str, result)) + '\n')  # 여기까지 쓰는 경우는 잘 없는 듯
```

반복문 안에서 문자열을 +=로 이어 붙이는 것 보다 list.append + join을 사용하는 방식이 훨씬 빠른데, 이유는 파이썬 문자열은 += 마다 새 문자열을 통째로 다시 만들기 때문입니다.

### 재귀 한도 설정 - DFS 짜기 전에 설정하면 좋음

```python
import sys
sys.setrecursionlimit(10**6)
```

파이썬 기본 재귀 한도는 1,000이며, DFS 같이 재귀 깊이가 긴 알고리즘을 풀 때 더 늘려줘야하는 상황이 잦습니다.

### 탐색은 list 대신 set으로

| 방법 (원소 10만 개, 1,000회 탐색 기준) | 시간 |
| --- | --- |
| `x in list` | 1.073초 |
| `x in set` | 0.00011초 |

set으로 탐색하는게 훨~~씬 빠릅니다.

| 자료형 | `in` 연산 | 이유 |
| --- | --- | --- |
| list | O(N) | 앞에서부터 하나씩 비교 |
| `set` / `dict`  | O(1) | 해시로 위치를 바로 계산 |

그러나, set이 항상 답은 아닙니다. 메모리는 `set` 방식이 더 무겁습니다.

원소 100만개 기준 `list` 약 7.6MB vs `set` 62.5MB

만약 N 이 크고 인덱스가 조밀하다면 리스트를 쓰는게 나을 수 있습니다.

### `enumerate` - 인덱스와 값을 함께

```python
for i in range(len(arr)):
		print(i, arr[i])
		
# 위 대신

for i, value in enumerate(arr):
		print(i, value)

# 응용 - 인덱스 1부터 시작
for rank, name in enumerate(names, start=1):
		print(rank, name)
```

### `zip` - 두 자료형을 하나로

```python
names = ['a', 'b', 'c']
scores = [10, 20, 30]

# zip은 두 자료형을 합쳐서 튜플로 만듦
list(zip(names, scores))  # [('a', 10), ('b', 20), ('c', 30)]
```

언패킹까지 응용하면?

```python
matrix = [[1,2,3], [4,5,6]]
[list(r) for r in zip(*matrix)]    # [[1,4], [2, 5], [3, 6]]

# 좌표 리스트를 x들과 y들로 분리
points = [(1, 2), (3, 4), (5, 6)]
xs, ys = zip(*points)                # (1, 3, 5) (2, 4, 6)
```

### 얕은 복사 vs 깊은 복사

```python
a = [[0] * 3] * 3
a[0][0] = 9
# → [[9,0,0], [9,0,0], [9,0,0]]   같은 리스트를 3번 참조

b = [[0] * 3 for _ in range(3)]
b[0][0] = 9
# → [[9,0,0], [0,0,0], [0,0,0]]
```

```python
# 함정 2 — 2차원 배열 복사
g = [[1, 2], [3, 4]]
s = g[:]              # 얕은 복사: 바깥 리스트만 새로 만듦
s[0][0] = 99
print(g)              # [[99, 2], [3, 4]]  원본이 오염됨

d = [row[:] for row in g]
d[0][0] = 99
print(g)              # [[1, 2], [3, 4]]  안전
```

기본 제공 라이브러리 `copy` 를 활용해서 `copy.deepcopy` 를 사용하면 되는거 아니냐?라고 할 수 있지만 매우 느립니다. 같은 구현체라면 약 19배 정도 느릴 수 있습니다.

### Python 적폐 1 - `collections`

```python
from collections import deque, Counter, defaultdict

# deque는 모두 아니까 패스

# 개수 세기
Counter('aabbbcc').most_common(2)  # 문자열에서 가장 많이 나타나는 글자 상위 2개를 찾는거
# 위 결과 : [('b', 3), ('a', 2)]

# 키가 없을 때 자동 초기화 — 그래프 인접 리스트에 최적
graph = defaultdict(list)
graph[1].append(2)                   # KeyError 안 남
```

### Python 적폐 2 - `itertools`

```python
from itertools import permutations, combinations, product

# 구현해야할 것들을 매우 많이 절감, 그러나 삼성 코테에서는 못쓰는듯..
product(range(4), repeat=3)       # 중복순열 — 방향 조합, 주사위 등
```

### 그 외 자잘하게 은근 쓰이는 것들

```python
# 시:분:초 변환
h, rest = divmod(total_sec, 3600)
m, s = divmod(rest, 60)

# 문자 <-> 숫자
ord('c') - ord('a') + 1           # 3
chr(ord('a') + 2)                 # 'c'

# 다중 기준 정렬 (1번은 오름차순, 2번은 내림차순)
arr.sort(key=lambda x: (x[0], -x[1]))

# 조건 확인
if all(cell == 0 for cell in row): ...  # 모두 true여야 true
if any(cell == 1 for cell in row): ...  # 하나라도 true라면 true

# 누적합
from itertools import accumulate
list(accumulate([1,2,3,4]))       # [1, 3, 6, 10]

# 나눗셈 함정 — 파이썬 //는 버림이 아니라 내림(floor)
 7 // 2   #  3
-7 // 2   # -4        int(-7/2)는 -3. 음수 좌표에서 결과가 다르다
-7 %  3   #  2        나머지는 항상 0 이상
```

## 교재 예제 문제

### 상하좌우

N *N 격자, (1,1)에서 시작, L / R / U / D 계획서대로 이동하되, 격자를 벗어나는 이동은 무시. 최종 자표 출력

시뮬레이션 기본 형태.. 이동 후 좌표를 먼저 계산하고 유효할때만 반영.

```python
n = int(input())
plans = input().split()

MOVE = {'L': (0, -1), 'R': (0, 1), 'U': (-1, 0), 'D': (1, 0)}

x = y = 1

for p in plans:
		dx, dy = MOVE[p]
		nx, ny = x + dx, y + dy
		if 1 <= nx <= n and 1 <= ny <= n:  # 유효할때만 반영
				x, y = nx, ny
	
print(x, y)
```

책에서는 dx, dy, move_types 세 리스트를 두고 매 명령마다 4개를 순회하며 일치하는 문자를 찾는데,

딕셔너리를 사용하면 그 내부 반복문을 안써도 됩니다. 문자 → 값 매핑이므로 dict를 쓰면 매우 편합니다.

### 시각

00:00:00 ~ N시 59분 59초 중 숫자 3이 하나라도 포함된 시각의 개수.

전체 경우가 24 * 60 * 60 = 86,400개 뿐, 완탐으로 전부 셀 수 있을 듯?

```python
h = int(input())

count = sum(     # 3이 하나라도 들어있는 시각이 나타나면 1씩 더함
		1
		for i in range(h+1)
		for j in range(60)
		for k in range(60)
		if '3' in f"{i}{j}{k}"
)

print(count)
```

00:00:00 format을 채우지 않아도 되나? ⇒ 우리가 찾는건 3의 존재 여부입니다. 앞에 붙는 ‘0’은 ‘3’을 만들지도, 가리지도 않아서 패딩이 결과에 영향을 주지 않습니다.

그러나 만약 3이 몇 번 나오는가?를 센다면 다르게 풀어야 합니다.

### 왕실의 나이트

8*8 체스판, a1 형태로 위치 입력. 나이트가 이동 가능한 경우의 수 출력

1. 8방향 이동 벡터를 리스트로 정의.
2. 문자열 (a~h) → 숫자 변환은 `ord()` 채용해봄

```python
data = input().strip()

col = ord(data[0]) - ord('a') + 1   # 'a' -> 1, 'c' -> 3
row = int(data[1])

STEPS = [(-2, -1), (-1, -2), (1, -2), (2, -1),
         (2, 1), (1, 2), (-1, 2), (-2, 1)]

result = sum(1 for dr, dc in STEPS if 1 <= row+dr <= 8 and 1 <= col + dc <= 8)  # 가능한 경우의 수마다 1씩 더함
print(result)
```

### 게임 개발

N * M 맵(0 = 육지, 1 = 바다), 캐릭터가 방향 d(0 - 북 | 1 - 동 | 2 - 남 | 3 - 서)를 보고 있습니다.

매 턴 왼쪽으로 회전해 가보지 않은 육지가 있다면 전진, 없으면 회전만.

네 방향 모두 막히면 방향 유지한 채 후진, 후진도 바다면 종료.

방문한 칸 수 출력

시뮬레이션의 정석!

```python
import sys
input = sys.stdin.readline

n, m = map(int, input().split())
x, y, d = map(int, input().split())
board = [list(map(int, input().split())) for _ in range(n)]

DR = (-1, 0, 1, 0)  # 북 동 남 서
DC = (0, 1, 0, -1)

visited = [[False] * m for _ in range(n)]
visited[x][y] = True
count = 1
turns = 0

while True:
		d = (d - 1) % 4    # 왼쪽으로 회전
		nx, ny = x + DR[d], y + DC[d]
		
		if not visited[nx][ny] and board[nx][ny] == 0:
				visited[nx][ny] = True
				x, y = nx, ny
				count += 1
				turns = 0
				coutninue
				
		turns += 1
		
		if turns == 4:    # 네 방향 모두 막히면? 후진
				bx, by = x - DR[d], y - DC[d]
				if board[bx][by] == 0:
						x, y = bx, by
						turns = 0
				else:
						break

print(count)		
```