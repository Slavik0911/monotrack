function getCurrentDateLabel() {
  const date = new Date();
  const weekday = new Intl.DateTimeFormat("uk-UA", {
    weekday: "long",
  }).format(date);
  const dayMonth = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(date);

  return `${weekday}, ${dayMonth}`.toLocaleUpperCase("uk-UA");
}

export default function PageTitle({ title }) {
  return (
    <section className="pt-1 sm:pt-3">
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#7A7E87]">
        {getCurrentDateLabel()}
      </p>
      <h1 className="mt-1 text-[30px] font-medium leading-tight text-[#F4F1EA] sm:text-[38px]">
        {title}
      </h1>
    </section>
  );
}
