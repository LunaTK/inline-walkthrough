const presets = [
  {
    label: "너의 역할과 기능을 소개해줘",
    message: "너의 역할과 기능을 소개해줘",
  },
  {
    label: "현재 페이지 주요 기능 하나를 walkthrough로 보여줘",
    message: "현재 페이지 주요 기능 하나를 탐색해서 walkthrough로 보여줘",
  },
  {
    label: "주요 기능 3가지를 살펴보고 하나를 시연해줘",
    message:
      "현재 페이지의 주요 기능 3가지를 파악해 간단히 소개한 다음, ask_user_choices 도구로 walkthrough를 보고 싶은 기능 하나를 선택하게 해주세요. 선택한 기능을 walkthrough로 보여주세요.",
  },
];

export function Onboarding({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div class="empty">
      <h2>어떤 동작을 확인해 볼까요?</h2>
      <ol>
        <li>테스트하고 싶은 동작을 묘사해 주세요.</li>
        <li>
          <strong>Probe</strong> — 에이전트가 해당 동작을 수행하는 데 필요한 HTML Element를
          탐색합니다.
        </li>
        <li>
          <strong>Walkthrough</strong> — 에이전트가 가이드 UI와 함께 해당 동작을 시연합니다.
        </li>
      </ol>

      <div class="suggestions">
        {presets.map(({ label, message }) => (
          <button key={label} class="suggestion" onClick={() => onSelect(message)}>
            {label} <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
