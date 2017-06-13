export default function moistureLevel2MoistureValue(level) {
    let levelToMoistureValue = {
        "very_low": 10,
        "low": 30,
        "medium": 50,
        "high": 70,
        "very_high": 90
    }

    return levelToMoistureValue[level]
}
