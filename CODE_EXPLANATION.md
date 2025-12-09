# 📚 Разбор кода MoodPage и связанных компонентов

## 🎯 Общая архитектура

```
MoodPage.tsx (страница)
    ↓
    ├── moodConfig.ts (конфигурация настроений)
    ├── moodStorage.ts (работа с localStorage)
    ├── MoodSelector.tsx (компонент селектора)
    └── MoodCard.tsx (карточка настроения)
```

---

## 1️⃣ **MoodPage.tsx** - Главная страница

### Импорты и зависимости

```tsx
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import MoodSelector, { MoodCard, type Mood } from "../components/MoodSelector/MoodSelector";
import { moods } from "../utils/moodConfig";
import { saveMoodForToday, getMoodByDate } from "../utils/moodStorage";
```

**Что здесь происходит:**
- `useState` - React хук для управления состоянием
- `Box, Typography` - компоненты Material-UI для стилизации
- `MoodCard` - компонент карточки настроения (экспортируется из MoodSelector)
- `moods` - массив всех доступных настроений
- `saveMoodForToday, getMoodByDate` - функции для работы с localStorage

---

### Инициализация состояния (строки 12-20)

```tsx
const [selectedMood, setSelectedMood] = useState<string | null>(() => {
  // Use local time to get today's date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;
  return getMoodByDate(todayStr);
});
```

**Логика:**
1. **Lazy initialization** - функция в `useState(() => {...})` выполняется только один раз при первом рендере
2. **Формирование даты** - получаем текущую дату в формате `YYYY-MM-DD` (например, `2025-12-04`)
   - `getMonth() + 1` - потому что `getMonth()` возвращает 0-11, а нам нужно 1-12
   - `padStart(2, "0")` - добавляет ведущий ноль (например, `"4"` → `"04"`)
3. **Загрузка из localStorage** - `getMoodByDate(todayStr)` ищет сохраненное настроение для сегодняшней даты
4. **Результат** - `selectedMood` будет либо строкой (`"mood-good"`), либо `null`

**Важно:** Используется локальное время, а не UTC, чтобы избежать проблем с часовыми поясами.

---

### Обработчик клика (строки 22-28)

```tsx
const handleMoodClick = (moodName: string) => {
  const newSelectedMood = moodName === selectedMood ? null : moodName;
  setSelectedMood(newSelectedMood);
  saveMoodForToday(newSelectedMood);
};
```

**Логика:**
1. **Toggle логика** - если кликнули на уже выбранное настроение, снимаем выбор (`null`)
2. **Обновление состояния** - `setSelectedMood` обновляет UI немедленно
3. **Сохранение в localStorage** - `saveMoodForToday` сохраняет данные и отправляет событие другим компонентам

**Почему так:**
- Сначала обновляем UI (быстрая реакция)
- Потом сохраняем в localStorage (может быть медленнее)

---

### Рендер компонента (строки 30-70)

```tsx
return (
  <Box sx={{ ... }}>
    <Typography>Какое у вас сегодня настроение?</Typography>
    <MoodSelector />
    
    <Box sx={{ ... }}>
      {moods.map((mood) => (
        <MoodCard
          key={mood.name}
          mood={mood}
          isSelected={selectedMood === mood.name}
          onClick={() => handleMoodClick(mood.name)}
        />
      ))}
    </Box>
  </Box>
);
```

**Логика:**
1. **MoodSelector** - пустой компонент (не используется, можно удалить)
2. **Маппинг настроений** - для каждого настроения из массива `moods` создается `MoodCard`
3. **Пропсы MoodCard:**
   - `mood` - объект настроения (name, label, image, color)
   - `isSelected` - булево значение, определяет визуальное выделение
   - `onClick` - функция, которая вызывается при клике

**React паттерн:** `key={mood.name}` - обязательный атрибут для списков, помогает React отслеживать элементы.

---

## 2️⃣ **moodConfig.ts** - Конфигурация настроений

```tsx
// Динамическая загрузка изображений
const allMoodImages = Object.values(
  import.meta.glob("../assets/images/mood-*.png", {
    eager: true,
    import: "default",
  })
) as string[];

// Конфигурация настроений
export const moodConfig = [
  { name: "mood-awesome", label: "awesome", color: "#FF6B35" },
  { name: "mood-good", label: "good", color: "#FFD93D" },
  // ...
];

// Создание массива настроений с изображениями
export const moods: Mood[] = moodConfig
  .map((mood) => {
    const image = allMoodImages.find((img) => img.includes(mood.name));
    return image ? { ...mood, image } : null;
  })
  .filter((mood): mood is Mood => mood !== null);
```

**Логика:**
1. **import.meta.glob** - Vite функция для динамической загрузки файлов
   - `"../assets/images/mood-*.png"` - паттерн поиска файлов
   - `eager: true` - загружает все файлы сразу (не lazy)
2. **Маппинг настроений** - для каждого настроения ищется соответствующее изображение
3. **Type guard** - `filter((mood): mood is Mood => mood !== null)` - TypeScript проверка типа

**Результат:** Массив `moods` содержит объекты типа `Mood` с полями: `name`, `label`, `image`, `color`.

---

## 3️⃣ **moodStorage.ts** - Работа с localStorage

### Структура данных в localStorage

```typescript
// Ключ в localStorage
const SELECTED_MOOD_KEY = "selectedMood";

// Формат данных (новый)
{
  "2025-12-03": "mood-good",
  "2025-12-04": "mood-awesome"
}

// Старый формат (мигрируется автоматически)
"mood-angry"  // строка
```

---

### Функция получения текущей даты

```typescript
const getTodayLocalDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
```

**Зачем:** Единая точка получения даты в формате `YYYY-MM-DD` с использованием локального времени.

---

### Миграция старых данных

```typescript
const migrateOldFormat = (): void => {
  const stored = localStorage.getItem(SELECTED_MOOD_KEY);
  if (!stored) return;
  
  try {
    const parsed = JSON.parse(stored);
    // Если уже объект - новый формат, ничего не делаем
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return;
    }
  } catch {
    // Если парсинг не удался (старая строка) - мигрируем
    const today = getTodayLocalDate();
    const newData: MoodStorageData = { [today]: stored };
    localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(newData));
  }
};
```

**Логика:**
1. Проверяем, есть ли данные в localStorage
2. Пытаемся распарсить JSON
3. Если это объект - формат новый, ничего не делаем
4. Если парсинг не удался (старая строка) - создаем объект с текущей датой

**Пример миграции:**
```javascript
// Было: "mood-angry"
// Стало: { "2025-12-04": "mood-angry" }
```

---

### Получение данных из localStorage

```typescript
const getMoodStorageData = (): MoodStorageData => {
  migrateOldFormat(); // Сначала мигрируем, если нужно
  const stored = localStorage.getItem(SELECTED_MOOD_KEY);
  if (!stored) return {};
  
  try {
    const parsed = JSON.parse(stored);
    // Edge case: если все еще строка
    if (typeof parsed === "string") {
      const today = getTodayLocalDate();
      const newData: MoodStorageData = { [today]: parsed };
      localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(newData));
      return newData;
    }
    return parsed as MoodStorageData;
  } catch {
    return {};
  }
};
```

**Логика:**
1. Вызываем миграцию
2. Получаем данные из localStorage
3. Парсим JSON
4. Обрабатываем edge cases (если все еще строка)
5. Возвращаем объект или пустой объект `{}`

---

### Сохранение настроения для сегодня

```typescript
export const saveMoodForToday = (mood: string | null): void => {
  const today = getTodayLocalDate();
  const data = getMoodStorageData();
  
  if (mood) {
    data[today] = mood; // Добавляем/обновляем
  } else {
    delete data[today]; // Удаляем, если null
  }
  
  localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(data));
  
  // Отправляем событие другим компонентам
  window.dispatchEvent(
    new CustomEvent("moodChanged", { detail: mood })
  );
};
```

**Логика:**
1. Получаем текущую дату
2. Загружаем все данные из localStorage
3. Обновляем/удаляем настроение для сегодня
4. Сохраняем обратно в localStorage
5. **Отправляем кастомное событие** - это позволяет другим компонентам (например, `YearlyTracker`) обновиться автоматически

**Custom Event:**
```javascript
// Другие компоненты могут слушать это событие:
window.addEventListener("moodChanged", () => {
  // Обновить UI
});
```

---

### Получение настроения по дате

```typescript
export const getMoodByDate = (date: string): string | null => {
  const data = getMoodStorageData();
  return data[date] || null;
};
```

**Просто:** Получаем все данные и возвращаем значение по ключу-дате, или `null` если нет.

---

## 4️⃣ **MoodCard.tsx** - Компонент карточки настроения

```tsx
export const MoodCard: React.FC<MoodCardProps> = ({
  mood,
  isSelected,
  onClick,
}) => {
  return (
    <Box
      sx={{
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-5px)",
        },
      }}
      onClick={onClick}
    >
      <Typography>{mood.label}</Typography>
      <Box
        component="img"
        src={mood.image}
        sx={{
          border: isSelected ? "3px solid" : "3px solid transparent",
          borderColor: isSelected ? mood.color : "transparent",
          transform: isSelected ? "scale(1.15)" : "scale(1)",
        }}
      />
    </Box>
  );
};
```

**Логика:**
1. **Условный рендеринг** - стили меняются в зависимости от `isSelected`
2. **Hover эффект** - при наведении карточка поднимается
3. **Визуальное выделение** - выбранная карточка увеличивается и получает цветную рамку
4. **Accessibility** - `role="button"`, `aria-label`, `onKeyDown` для клавиатурной навигации

---

## 5️⃣ **YearlyTracker.tsx** - Годовая таблица настроений

### Инициализация и подписка на события

```tsx
const [refreshKey, setRefreshKey] = useState(1);

useEffect(() => {
  const handleMoodChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  window.addEventListener("moodChanged", handleMoodChange);
  
  // Принудительное обновление при монтировании
  setRefreshKey((prev) => prev + 1);
  
  // Слушаем изменения localStorage из других вкладок
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "selectedMood") {
      setRefreshKey((prev) => prev + 1);
    }
  };
  window.addEventListener("storage", handleStorageChange);
  
  return () => {
    window.removeEventListener("moodChanged", handleMoodChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}, []);
```

**Логика:**
1. **refreshKey** - искусственный ключ для принудительного обновления
2. **Слушаем кастомное событие** - когда настроение меняется в `MoodPage`
3. **Слушаем storage события** - для синхронизации между вкладками браузера
4. **Cleanup** - удаляем слушатели при размонтировании компонента

---

### Предвычисление цветов ячеек

```tsx
const cellColorsMap = useMemo(() => {
  const _ = refreshKey; // Принудительная зависимость
  
  const map = new Map<string, string | null>();
  for (let day = 1; day <= 31; day++) {
    for (let month = 1; month <= 12; month++) {
      if (!isValidDay(day, month)) {
        map.set(`${day}-${month}`, null);
        continue;
      }
      const dateString = getDateString(day, month);
      const moodName = getMoodByDate(dateString);
      map.set(`${day}-${month}`, getMoodHexColor(moodName));
    }
  }
  return map;
}, [refreshKey, currentYear]);
```

**Логика:**
1. **useMemo** - кэширует результат вычислений
2. **Двойной цикл** - перебираем все дни (1-31) и месяцы (1-12)
3. **Проверка валидности** - пропускаем невалидные дни (например, 31 февраля)
4. **Формирование даты** - создаем строку `YYYY-MM-DD`
5. **Получение настроения** - ищем в localStorage
6. **Конвертация в цвет** - преобразуем имя настроения в hex-цвет
7. **Сохранение в Map** - для быстрого доступа при рендере

**Почему Map:**
- Быстрый поиск: `O(1)` вместо `O(n)` в массиве
- Ключ: `"day-month"` (например, `"4-12"`)

---

### Рендер таблицы

```tsx
<Box sx={{ display: "grid", gridTemplateColumns: "30px repeat(12, 24px)" }}>
  {/* Заголовки месяцев */}
  <Box key="corner" />
  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
    <Typography key={`month-${month}`}>{month}</Typography>
  ))}

  {/* Строки для каждого дня */}
  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
    <Box key={`row-${day}`} sx={{ display: "contents" }}>
      <Typography>{day}</Typography>
      {/* 12 ячеек для каждого месяца */}
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
        const isValid = isValidDay(day, month);
        const cellColor = getCellColor(day, month);
        
        return (
          <Box
            sx={{
              backgroundColor: isValid
                ? cellColor || "#FFFFFF"
                : "#F3F3F3",
              border: isValid
                ? cellColor ? "none" : "1px solid #C7C7C7"
                : "none",
            }}
          />
        );
      })}
    </Box>
  ))}
</Box>
```

**Логика:**
1. **CSS Grid** - создает сетку: 30px (дни) + 12×24px (месяцы)
2. **Вложенные циклы** - для каждого дня (1-31) создаем строку с 12 ячейками
3. **Условный рендеринг:**
   - Невалидные дни → серый фон `#F3F3F3`
   - Дни с настроением → цвет настроения
   - Дни без настроения → белый фон с рамкой

---

## 🔄 Поток данных (Data Flow)

```
1. Пользователь открывает MoodPage
   ↓
2. useState(() => getMoodByDate("2025-12-04"))
   ↓
3. getMoodByDate → getMoodStorageData → localStorage.getItem("selectedMood")
   ↓
4. Возвращается "mood-good" или null
   ↓
5. selectedMood = "mood-good"
   ↓
6. Рендер: MoodCard с isSelected={true} для "mood-good"
   ↓
7. Пользователь кликает на другое настроение
   ↓
8. handleMoodClick("mood-awesome")
   ↓
9. setSelectedMood("mood-awesome") → UI обновляется
   ↓
10. saveMoodForToday("mood-awesome")
    ↓
11. localStorage.setItem("selectedMood", { "2025-12-04": "mood-awesome" })
    ↓
12. window.dispatchEvent("moodChanged")
    ↓
13. YearlyTracker слушает событие → setRefreshKey(prev => prev + 1)
    ↓
14. useMemo пересчитывается → cellColorsMap обновляется
    ↓
15. Таблица перерисовывается с новым цветом
```

---

## 🎓 Ключевые React паттерны

### 1. **Lazy Initialization State**
```tsx
const [state, setState] = useState(() => {
  // Выполняется только один раз
  return expensiveCalculation();
});
```

### 2. **useMemo для оптимизации**
```tsx
const expensiveValue = useMemo(() => {
  return heavyCalculation();
}, [dependency]);
```

### 3. **Custom Events для межкомпонентной коммуникации**
```tsx
// Отправка
window.dispatchEvent(new CustomEvent("moodChanged"));

// Подписка
window.addEventListener("moodChanged", handler);
```

### 4. **Type Guards в TypeScript**
```tsx
.filter((mood): mood is Mood => mood !== null)
```

### 5. **Conditional Rendering**
```tsx
{isSelected ? "selected" : "not selected"}
```

---

## 📝 Важные моменты для фронтендера

1. **Всегда используйте локальное время** для дат (не UTC)
2. **Миграция данных** должна быть обратно совместимой
3. **Custom Events** - простой способ синхронизации компонентов
4. **useMemo** - оптимизация тяжелых вычислений
5. **Cleanup в useEffect** - всегда удаляйте слушатели событий
6. **TypeScript type guards** - для безопасной работы с типами

---

## 🐛 Отладка

### Проверить данные в localStorage:
```javascript
// В консоли браузера
JSON.parse(localStorage.getItem("selectedMood"))
```

### Проверить текущую дату:
```javascript
const today = new Date();
const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
console.log(dateStr);
```

### Проверить события:
```javascript
window.addEventListener("moodChanged", (e) => {
  console.log("Mood changed:", e.detail);
});
```



