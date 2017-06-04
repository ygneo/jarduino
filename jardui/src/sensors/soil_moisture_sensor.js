export default function moistureLevel2MoistureValue(level) {
    let levelToMoistureValue = {
        "very_low": 150,
        "low": 300,
        "medium": 450,
        "high": 600,
        "very_high": 750
    }

    return levelToMoistureValue[level]
}
