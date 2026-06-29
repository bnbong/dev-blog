---
title: 생소하거나 헷갈리는 Java 문법들
description: 생소하거나 헷갈리는 Java 문법들
authors:
- bnbong
date:
  created: 2026-06-28
  updated: 2026-06-28
categories:
- Java
tags:
- Java
- programming
- syntax
- interview
- coding test
comments: true
---

??? note "Series: 생소한 프로그래밍 언어 문법"

    [0. Python편](https://bnbong.com/blog/20260427-python-difficult-syntax/)

    [1. Java편](20260627.md)

## 들어가며: 왜 Java 문법은 점점 헷갈려졌는가

[직전 글](https://bnbong.com/blog/20260427-python-difficult-syntax/)에서 동적 타입 언어 특유의 헷갈리는 문법을 다뤘다면, 이번에는 정적 타입 언어인 Java를 다룹니다.

같은 "헷갈림"이라도 두 언어는 결이 꽤 다릅니다. Python이 "이게 언제 평가되지?" 같은 동적 동작에서 혼란을 준다면, Java는 **같은 일을 하는 방법이 여러 개**라서 헷갈립니다.

Java는 오래된 언어지만 Java 8(람다·스트림) 이후로 `var`, `record`, `sealed`, switch 표현식, 패턴 매칭, 텍스트 블록이 빠르게 추가됐습니다. 그래서 "예전 방식"과 "새 방식"이 공존하고, 그중 일부(오토박싱, 타입 소거 등)는 직관과 다르게 동작합니다.

이 글의 기준 버전은 **Java 21(LTS)**로 잡되, 각 문법이 도입된 버전을 함께 표기합니다.

---

## 1. 제네릭과 와일드카드: `? extends` vs `? super`, 그리고 타입 소거

제네릭은 Java 5에서 도입됐습니다.[^generics] 자주 헷갈릴 수 있는 부분은 **와일드카드(`?`)의 방향**과 **타입 소거**입니다.

### `? extends`와 `? super` — PECS

- `List<? extends Number>` : Number의 **하위 타입**을 담는 리스트. 값을 **꺼내 읽기**(producer)에 적합합니다.
- `List<? super Integer>` : Integer의 **상위 타입**을 담는 리스트. 값을 **넣기**(consumer)에 적합합니다.

이 원칙을 *Effective Java*는 **PECS(Producer-Extends, Consumer-Super)**로 정리합니다.[^pecs]

```java
// producer에서 꺼내 읽기: extends
double sum(List<? extends Number> nums) {
    double s = 0;
    for (Number n : nums) s += n.doubleValue(); // 읽기 OK
    return s;
}

// consumer로 넣기: super
void fill(List<? super Integer> dst) {
    dst.add(1);   // 넣기 OK
    dst.add(2);
}
```

헷갈리는 핵심은 이겁니다. `List<? extends Number>`에는 **원소를 add 할 수 없습니다**(null 제외). 컴파일러가 정확한 원소 타입을 모르기 때문입니다.

```java
List<? extends Number> list = new ArrayList<Integer>();
list.add(1); // 컴파일 에러: add 불가
```

### 타입 소거(type erasure)의 함정

제네릭 타입 정보는 컴파일 후 **런타임에 지워집니다**. 이를 타입 소거라 합니다.[^erasure] 

그래서 다음이 성립합니다:

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass()); // true (둘 다 ArrayList.class)
```

런타임에는 `List<String>`과 `List<Integer>`가 같은 `List`로 취급됩니다. 그래서 `new T[]` 같은 제네릭 배열 생성이 불가능하고, `obj instanceof List<String>` 같은 매개변수화 타입 검사도 할 수 없습니다.

---

## 2. `var`: 지역 변수 타입 추론이 되는 곳과 안 되는 곳

`var`는 Java 10에서 도입된 **지역 변수 타입 추론** 문법입니다.[^var] 

새로운 동적 타입이 아니라, 컴파일 시점에 우변으로부터 타입을 추론할 뿐 여전히 정적 타입입니다.

```java
var list = new ArrayList<String>(); // ArrayList<String>로 추론
var i = 10;                          // int로 추론
```

**쓸 수 없는 경우** — 추론할 근거가 없을 때입니다:

```java
var x;            // 에러: 초기화 없음
var y = null;     // 에러: null만으로는 추론 불가
// 메서드 파라미터, 필드, 반환 타입에는 var 사용 불가
```

> 참고: 메서드 파라미터에는 `var`를 쓸 수 없지만, **람다 파라미터**에는 Java 11부터 `var`를 쓸 수 있습니다.[^lambdavar] 예: `(var a, var b) -> a + b`.

가독성 트레이드오프도 있습니다. 우변이 `new ArrayList<String>()`처럼 타입이 명확하면 `var`가 깔끔하지만, `var result = process();`처럼 우변만 봐서 타입을 알기 어려우면 오히려 가독성을 해칩니다. 

정보처리기사 실기 관점에서 기억할만한 내용으로는 **"우변이 없으면 추론 불가"**라는 규칙이 있겠습니다.

---

## 3. 오토박싱·언박싱과 `==`의 함정

이건 정보처리기사 실기 출력 예측 문제의 단골입니다. `Integer` 같은 래퍼 타입과 기본형(`int`) 사이의 자동 변환을 오토박싱/언박싱이라 합니다.

```java
Integer boxed = 100;   // 오토박싱: 내부적으로 Integer.valueOf(100)
int unboxed = boxed;   // 언박싱: boxed.intValue()
```

함정은 `==`입니다. `==`는 **객체 참조(주소)를 비교**하고, `equals()`는 **값을 비교**합니다. 

그런데 `Integer.valueOf`는 **`-128 ~ 127` 범위의 값을 캐시**해 같은 객체를 돌려주도록 명세상 보장합니다.[^intcache]

```java
Integer a = 100, b = 100;
System.out.println(a == b);      // true  (캐시 범위 -128~127 안 → 같은 객체)
System.out.println(a.equals(b)); // true  (값 비교)

Integer c = 200, d = 200;
System.out.println(c == d);      // 보통 false (기본 설정 기준) — 단, 명세상 보장되는 값은 아니다
System.out.println(c.equals(d)); // true  (값 비교)
```

정확히 말하면, Java는 `-128 ~ 127` 범위만 같은 객체로 캐시함을 **보장**합니다. 그 밖의 값(200 등)은 기본 설정에서는 보통 새 객체가 만들어져 `==`가 `false`로 나오지만, 캐시 상한은 `-XX:AutoBoxCacheMax` 같은 JVM 옵션으로 조정될 수 있어 **항상 `false`라고 단정할 수는 없습니다**. 

그래서 핵심 교훈은 이렇습니다:

> 래퍼 타입의 값 비교는 **항상 `equals()`**(또는 `intValue()`로 언박싱 후 `==`)를 씁니다.

`100 == 100`은 캐시 덕분에 `true`가 나오는 것이지 "값이 같아서"가 아니라는 점을 구분하는 게 포인트입니다.

---

## 4. 함수형 인터페이스·람다·메서드 참조(`::`)

**함수형 인터페이스**는 추상 메서드가 정확히 하나인 인터페이스입니다.[^funcif] 람다는 이런 인터페이스의 인스턴스를 간결하게 표현합니다.

```java
// 익명 클래스 (예전 방식)
Runnable r1 = new Runnable() {
    public void run() { System.out.println("run"); }
};
// 람다 (Java 8+)
Runnable r2 = () -> System.out.println("run");
```

**메서드 참조 `::`** 는 람다가 단순히 기존 메서드를 호출만 할 때 더 짧게 쓰는 문법입니다.

```java
List<String> names = List.of("b", "a", "c");
names.forEach(s -> System.out.println(s)); // 람다
names.forEach(System.out::println);        // 메서드 참조 (동일)
```

### 람다와 익명 클래스의 결정적 차이: `this`

같아 보이지만 `this`의 의미가 다릅니다. 

**익명 클래스에서 `this`는 익명 클래스 자신**을 가리키지만, **람다에서 `this`는 람다를 감싼 바깥 클래스(enclosing instance)**를 가리킵니다.[^lambdathis]

```java
class Outer {
    int x = 10;
    void run() {
        Runnable lambda = () -> System.out.println(this.x); // Outer의 this → 10
        Runnable anon = new Runnable() {
            // 여기서 this는 익명 클래스 자신. Outer.this.x로 접근해야 함
            public void run() { System.out.println(Outer.this.x); }
        };
    }
}
```

또한 람다가 캡처하는 지역 변수는 **사실상 final(effectively final)**이어야 합니다.

```java
int count = 0;
Runnable r = () -> System.out.println(count); // OK (재할당 안 하면 사실상 final)
// count = 1;  // 이 줄이 있으면 위 람다는 컴파일 에러
```

---

## 5. record와 sealed 클래스

### record (Java 16)

`record`는 불변 데이터를 담는 클래스의 보일러플레이트(생성자, `equals`, `hashCode`, `toString`, getter)를 자동 생성합니다.[^record]

```java
// 기존 방식이라면 수십 줄
record Point(int x, int y) {}

Point p = new Point(1, 2);
p.x();                    // 접근자 (getX가 아니라 x())
p.equals(new Point(1,2)); // true (값 기반 자동 구현)
System.out.println(p);    // Point[x=1, y=2]
```

record의 필드는 `final`이며, record는 암묵적으로 `final` 클래스라 상속할 수 없습니다.

### sealed 클래스 (Java 17)

`sealed`는 **어떤 타입이 상속/구현될 수 있는지를 `permits`로 제한**합니다.[^sealed]

```java
sealed interface Shape permits Circle, Rectangle {}
record Circle(double r) implements Shape {}
record Rectangle(double w, double h) implements Shape {}
```

이렇게 하면 `Shape`의 하위 타입이 `Circle`, `Rectangle`로 **닫혀 있음**이 보장됩니다. 이 보장은 다음 절의 switch 패턴 매칭에서 **빠짐없음(exhaustiveness) 검사**와 맞물려 강력해집니다.

---

## 6. switch 표현식과 패턴 매칭, 텍스트 블록

### switch 표현식 (Java 14)

기존 switch는 **문(statement)**이라 값을 돌려주지 못하고, `break`를 빼먹는 fall-through 버그가 잦았습니다. switch **표현식**은 값을 돌려주며 화살표(`->`) 라벨을 쓰면 fall-through가 없습니다.[^switchexpr]

```java
// 잘못된 예: break 누락 → fall-through 버그
int days;
switch (month) {
    case 2: days = 28; // break 없음! 다음 case로 흘러내림
    case 4: days = 30;
    default: days = 31;
}

// 올바른 예: switch 표현식 + 화살표
int days2 = switch (month) {
    case 2 -> 28;
    case 4, 6, 9, 11 -> 30;
    default -> 31;
};
```

블록이 필요하면 `yield`로 값을 반환합니다.

```java
int v = switch (x) {
    case 1 -> 10;
    default -> {
        int t = compute(x);
        yield t * 2;   // 블록에서 값 반환은 return이 아니라 yield
    }
};
```

### `instanceof` 패턴 매칭 (Java 16)

`instanceof`로 검사한 뒤 다시 캐스팅하던 보일러플레이트를 없앱니다.[^instanceof]

```java
// 잘못된 예(번거로움): 검사 후 또 캐스팅
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}
// 올바른 예: 패턴 변수 s 바인딩
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

### switch 패턴 매칭 (Java 21)

타입에 따라 분기하면서 패턴 변수까지 바인딩합니다. sealed 타입과 함께 쓰면 모든 경우를 다뤘는지 컴파일러가 검사합니다.[^switchpattern]

```java
String describe(Shape shape) {
    return switch (shape) {
        case Circle c -> "원, 반지름 " + c.r();
        case Rectangle r -> "사각형 " + r.w() + "x" + r.h();
        // Shape가 sealed라 두 case로 빠짐없이 커버됨 → default 불필요
    };
}
```

### 텍스트 블록 (Java 15)

여러 줄 문자열을 `"""`로 감싸 이스케이프 없이 씁니다.[^textblock]

```java
String json = """
    {
      "name": "bnbong",
      "lang": "Java"
    }
    """;
```

---

## 7. Optional 올바르게 쓰기

`Optional`은 "값이 있을 수도, 없을 수도 있음"을 타입으로 표현해 **반환값에서 `null`을 줄이려는** API입니다.[^optional]

```java
// 잘못된 예: Optional을 만들고도 get()으로 바로 까기 → NoSuchElementException 위험
Optional<String> opt = find();
String s = opt.get();  // 비어 있으면 예외

// 올바른 예: 없을 때의 대안을 함께 표현
String s2 = opt.orElse("default");
opt.ifPresent(v -> System.out.println(v));
```

*Effective Java*가 권하는 사용 지침은 이렇습니다.

- `Optional`은 주로 **메서드 반환 타입**에 씁니다.
- `Optional`은 **필드, 메서드 파라미터, 컬렉션의 원소**에는 쓰지 않기를 권장합니다(불필요한 래핑 및 복잡도 증가).
- `Optional<Integer>`처럼 박싱된 기본형을 감싸기보다 `OptionalInt` 등 전용 타입을 고려합니다.
  - 이는 이중 래핑 비용 때문이며 `Optional<Integer>`를 쓰면 값 하나를 담는 데 객체가 두 번 감싸집니다.

    1. `int` → `Integer` (오토박싱: 힙에 Integer 객체 생성)
    2. `Integer` → `Optional` (다시 힙에 Optional 객체 생성)
   
    즉 원시값 하나 때문에 힙 객체가 2개 만들어집니다. 반면 `OptionalInt`는 내부에 `int` 값을 원시 타입 그대로 들고 있어서 `Integer` 박싱이 없습니다. 객체 한 겹만 생깁니다.

> 흔한 오해: "`null` 대신 무조건 `Optional`을 쓰면 좋다"는 것은 사실이 아닙니다. `Optional` 자체도 `null`이 될 수 있고(`Optional` 변수에는 절대 `null`을 넣으면 안 됨), 무분별하게 쓰면 코드만 장황해집니다.

---

## 8. 정리: 도입 버전과 선택 기준

| 문법 | 도입 버전 | 핵심 포인트 |
|---|---|---|
| 제네릭 / 타입 소거 | Java 5 | PECS, 런타임에 타입 정보 사라짐 |
| 람다 / 메서드 참조 | Java 8 | 람다의 `this`는 바깥 클래스 |
| `var` | Java 10 | 지역 변수 한정, 우변 필수 |
| 람다 파라미터 `var` | Java 11 | `(var a) -> ...` 가능 |
| switch 표현식 | Java 14 | `->`, `yield` |
| 텍스트 블록 | Java 15 | `"""` |
| record / `instanceof` 패턴 | Java 16 | 불변 데이터, 패턴 변수 바인딩 |
| sealed 클래스 | Java 17 | `permits`로 상속 제한 |
| switch 패턴 매칭 | Java 21 | sealed와 빠짐없음 검사 |

단순한 판단 기준은 이렇습니다:

- **래퍼 타입 비교** → 무조건 `equals()`. `==`는 캐시 때문에 운에 맡기는 셈입니다.
- **와일드카드 방향** → 읽으면 `extends`, 넣으면 `super`(PECS).
- **switch** → 값을 돌려줄 거면 표현식(`->`)을, fall-through가 필요한 게 아니라면 화살표 라벨을 씁니다.
- **Optional** → 반환 타입에만, 필드/파라미터엔 자제.

![java_gosu](java_gosu.png)
/// caption
Java 고수의 길은 멀고도 험하다...
///

다음 글에서는 C 언어의 생소한 문법으로 이어가겠습니다.

[^generics]: Oracle, *The Java™ Tutorials — Generics*. <https://docs.oracle.com/javase/tutorial/java/generics/index.html>
[^pecs]: Joshua Bloch, *Effective Java* (3rd ed.), Item 31 "Use bounded wildcards to increase API flexibility" — PECS(Producer-Extends, Consumer-Super) 원칙.
[^erasure]: Oracle, *The Java™ Tutorials — Type Erasure*. <https://docs.oracle.com/javase/tutorial/java/generics/erasure.html> / 형식 정의는 JLS SE 21 §4.6 "Type Erasure" <https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.6>
[^var]: JEP 286: *Local-Variable Type Inference* (Java 10). <https://openjdk.org/jeps/286>
[^lambdavar]: JEP 323: *Local-Variable Syntax for Lambda Parameters* (Java 11). <https://openjdk.org/jeps/323>
[^intcache]: JLS SE 21 §5.1.7 "Boxing Conversion" — `-128 ~ 127` 캐시 보장. <https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.7> / `Integer.valueOf(int)` API 문서. <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Integer.html#valueOf(int)>
[^funcif]: `java.util.function` 패키지 요약 및 `@FunctionalInterface`. <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/package-summary.html>
[^lambdathis]: JLS SE 21 §15.27.2 "Lambda Body" — 람다 본문에서 `this`는 둘러싼 인스턴스를 가리킴. <https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.27.2>
[^record]: JEP 395: *Records* (Java 16). <https://openjdk.org/jeps/395>
[^sealed]: JEP 409: *Sealed Classes* (Java 17). <https://openjdk.org/jeps/409>
[^switchexpr]: JEP 361: *Switch Expressions* (Java 14). <https://openjdk.org/jeps/361>
[^instanceof]: JEP 394: *Pattern Matching for instanceof* (Java 16). <https://openjdk.org/jeps/394>
[^switchpattern]: JEP 441: *Pattern Matching for switch* (Java 21). <https://openjdk.org/jeps/441>
[^textblock]: JEP 378: *Text Blocks* (Java 15). <https://openjdk.org/jeps/378>
[^optional]: `java.util.Optional` API 문서. <https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html> / 사용 지침은 Joshua Bloch, *Effective Java* (3rd ed.), Item 55 "Return optionals judiciously".
