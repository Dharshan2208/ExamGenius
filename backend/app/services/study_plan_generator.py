from datetime import datetime, timedelta

class StudyPlanGenerator:
    def generate_plan(self, topics: list, exam_date: str, availability: dict) -> dict:
        exam = datetime.strptime(exam_date, "%Y-%m-%d")
        today = datetime.now()
        days_left = (exam - today).days

        plan = {}
        for i in range(days_left):
            day = today + timedelta(days=i)
            plan[day.strftime("%Y-%m-%d")] = {
                "topics": topics[i % len(topics)][:3],  # Limit to 3 topics per day
                "hours": min(availability.get("hours_per_day", 4), 4)
            }
        return plan