const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

// Функция проверки курсирования (учитывает четность и конкретные даты)
function runsToday(train, dateObj) {
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 1. Проверка конкретных дат (если время меняется или поезд идет вне графика)
    if (train.specificDates && train.specificDates[dateStr]) return true;

    // 2. Проверка по периодам (четность/нечетность)
    if (train.periods) {
        for (let period of train.periods) {
            if (dateStr >= period.from && dateStr <= period.to) {
                if (period.parity === "even" && day % 2 === 0) return true;
                if (period.parity === "odd" && day % 2 !== 0) return true;
            }
        }
    }
    return false;
}

const passengerTrains = [
    {
        number: "61/261",
        route: "Івано-Франківськ → Дніпро",
        defaultTime: "10:50",
        periods: [
            { from: "2026-02-02", to: "2026-03-30", parity: "even" },
            { from: "2026-04-01", to: "2026-05-31", parity: "odd" },
            { from: "2026-06-02", to: "2026-07-30", parity: "even" },
            { from: "2026-09-02", to: "2026-10-30", parity: "even" },
            { from: "2026-11-01", to: "2026-12-31", parity: "odd" }
        ],
        specificDates: {
            "2026-04-09": "11:08", "2026-04-01": "10:50", "2026-04-03": "11:13",
            "2026-04-05": "11:13", "2026-04-07": "11:13", "2026-04-13": "10:50", "2026-04-15": "10:50"
        }
    },
    {
        number: "62/262",
        route: "Дніпро → Івано-Франківськ",
        defaultTime: "15:46",
        periods: [
            { from: "2026-02-01", to: "2026-03-31", parity: "odd" },
            { from: "2026-04-02", to: "2026-05-30", parity: "even" },
            { from: "2026-06-01", to: "2026-07-31", parity: "odd" },
            { from: "2026-09-01", to: "2026-10-31", parity: "odd" },
            { from: "2026-11-02", to: "2026-12-31", parity: "even" }
        ],
        specificDates: {
            "2026-04-10": "15:44", "2026-04-08": "15:46", "2026-04-06": "15:46"
        }
    },
    {
        number: "41",
        route: "Дніпро → Трускавець",
        defaultTime: "18:07",
        periods: [
            { from: "2026-02-01", to: "2026-03-31", parity: "odd" },
            { from: "2026-04-02", to: "2026-05-30", parity: "even" },
            { from: "2026-06-01", to: "2026-07-31", parity: "odd" },
            { from: "2026-09-01", to: "2026-10-31", parity: "odd" },
            { from: "2026-11-02", to: "2026-12-31", parity: "even" }
        ],
        specificDates: { "2026-04-10": "15:44" }
    },
    {
        number: "42",
        route: "Трускавець → Дніпро",
        defaultTime: "07:46",
        periods: [
            { from: "2026-02-02", to: "2026-03-30", parity: "even" },
            { from: "2026-04-01", to: "2026-05-31", parity: "odd" },
            { from: "2026-06-02", to: "2026-07-30", parity: "even" },
            { from: "2026-09-02", to: "2026-10-30", parity: "even" },
            { from: "2026-11-01", to: "2026-12-31", parity: "odd" }
        ],
        specificDates: { "2026-03-30": "07:46" }
    }
];

app.get("/api/passenger", (req, res) => {
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Kyiv"}));
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const result = passengerTrains.map(train => {
        const isRunning = runsToday(train, now);
        // Если есть спец. время на сегодня — берем его, иначе стандартное
        const time = (train.specificDates && train.specificDates[todayStr]) || train.defaultTime;

        return {
            number: train.number,
            route: train.route,
            time: time,
            isRunning: isRunning
        };
    });

    res.json({ station: "Вільногірськ", trains: result });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Passenger Server on port ${PORT}`));
