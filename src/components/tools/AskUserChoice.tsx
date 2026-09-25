export function AskUserChoice({
  question,
  choices,
  state,
  answer,
  error,
  onChoose,
}: {
  question?: string;
  choices?: string[];
  state: string;
  answer?: string;
  error?: string;
  onChoose: (choice: string) => void;
}) {
  const pending = state === "input-available";

  return (
    <div class="user-choice" data-state={state}>
      <p>{question ?? "Choose an option"}</p>
      {answer ? (
        <strong>You chose {answer}.</strong>
      ) : (
        <div class="choice-actions">
          {choices?.map((choice) => (
            <button key={choice} type="button" disabled={!pending} onClick={() => onChoose(choice)}>
              {choice}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
