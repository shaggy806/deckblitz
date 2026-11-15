/**
 * A target slot's label is written from its controller's side ("creature card
 * in your graveyard", "creature you control"). When another player chooses the
 * target (rule 603.3d with "of an opponent's choice" — Mausoleum Turnkey; a
 * spell whose targets someone else changes), "you" is the wrong player from
 * the chooser's seat, so it's retold with the controller's name.
 *
 * `label` is `describeTargetSpec`'s; `name` is how the chooser's client names
 * the controller.
 */
export function targetLabelFor(label: string, name: string): string {
  const s = `${name}'s`
  return (
    label
      .replace(/\byou don't control\b/g, `${name} doesn't control`)
      .replace(/\byou control\b/g, `${name} controls`)
      .replace(/\byou own\b/g, `${name} owns`)
      .replace(/\byour\b/g, s)
      // "Opponent" is the controller's too: the chooser may be one of them.
      .replace(/\ban opponent(?!s? of )/g, `${s} opponent`)
      .replace(/(?<!'s )\bopponent\b(?! of )/g, `opponent of ${name}`)
      .replace(/\byou\b/g, name)
  )
}
