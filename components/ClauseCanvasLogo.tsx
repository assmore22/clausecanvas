import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";

/**
 * Logo = ready-made FontAwesome icon (file-contract) + plain wordmark.
 * No custom SVG is drawn. Icon source documented in README.
 * https://fontawesome.com/icons/file-contract
 */
export function ClauseCanvasLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-document">
        <FontAwesomeIcon icon={faFileContract} className="h-[16px] w-[16px]" />
      </span>
      {!compact && <span className="serif text-[16px] font-semibold tracking-tight text-ink">ClauseCanvas</span>}
    </span>
  );
}
