const StatsSection = () => {
  return (
    <section className="lg:px-6 md:px-6 sm:px-6">
      <div className="mx-auto grid grid-cols-2 gap-x-6 py-4 sm:rounded-lg md:rounded-lg lg:rounded-lg max-w-6xl bg-orange-500 gap-y-8 text-center text-white sm:grid-cols-4">
        {[
          { value: '200+', label: 'Volunteer Applicants' },
          { value: '200+', label: 'Active Volunteers' },
          { value: '80+', label: 'Deployments' },
          { value: '15+', label: 'Trainings Held' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-black tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs font-medium text-orange-100">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
