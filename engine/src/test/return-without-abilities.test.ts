/**
 * "It's a Skeleton in addition to its other types and has no abilities"
 * (Xu-Ifit, Osteoharmonist — `put-onto-battlefield`'s `enterAs.loseAbilities`):
 * the loss is in place as the card enters (rule 614.12, the ruling), so its
 * enters triggers don't trigger, its "enters tapped" doesn't apply and a Clone
 * makes no copy choice; an ability it gains afterwards it keeps (rule 613.7).
 */
import { describe, expect, it } from "vitest";

import {
  activate,
  graveyard,
  grant,
  hand,
  keywords,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  zone,
} from "./harness.js";

function xuIfit(card: string) {
  const t = table();
  const xu = spawn(t.game, "Xu-Ifit, Osteoharmonist");
  const target = toGraveyard(t.game, card);
  return { ...t, xu, target };
}

describe("Xu-Ifit, Osteoharmonist", () => {
  it("returns a creature card as a Skeleton with no abilities", () => {
    const { game, xu, target } = xuIfit("Serra Angel");
    activate(game, xu, 0, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("battlefield");
    expect(subtypes(game, target)).toContain("Skeleton");
    expect(subtypes(game, target)).toContain("Angel");
    expect(keywords(game, target).has("flying")).toBe(false);
    expect(keywords(game, target).has("vigilance")).toBe(false);
  });

  it("its enters trigger never triggers", () => {
    const { game, xu, target } = xuIfit("Elvish Visionary");
    const before = hand(game).length;
    activate(game, xu, 0, { targets: [ref(target)] });
    settle(game);
    expect(zone(game, target)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });

  it("its own 'enters tapped' doesn't apply", () => {
    const { game, xu, target } = xuIfit("Dread Wanderer");
    activate(game, xu, 0, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("battlefield");
    expect(game.state.objects[target].tapped).toBe(false);
  });

  it("a Clone makes no copy choice: it enters as a 0/0 Clone and dies", () => {
    const { game, a, xu, target } = xuIfit("Clone");
    const angel = spawn(game, "Serra Angel");
    let asked = 0;
    a.chooseCopyFn = (_view, _source, options) => {
      asked += 1;
      return options.includes(angel) ? angel : null;
    };
    activate(game, xu, 0, { targets: [ref(target)] });
    settle(game);
    expect(asked).toBe(0);
    expect(graveyard(game)).toContain(target);
    expect(zone(game, xu)).toBe("battlefield");
  });

  it("keeps an ability it gains afterwards", () => {
    const { game, xu, target } = xuIfit("Grizzly Bears");
    activate(game, xu, 0, { targets: [ref(target)] });
    grant(game, target, "flying");
    expect(keywords(game, target).has("flying")).toBe(true);
  });
});
