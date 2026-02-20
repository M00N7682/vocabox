const stats = [
  { value: "500+", label: "학원" },
  { value: "15,000+", label: "학생" },
  { value: "98%", label: "만족도" },
  { value: "50만+", label: "평가 기록" },
];

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 bg-eo-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stat.value}
              </div>
              <div className="mt-2 text-sm sm:text-base text-indigo-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
