/**
 * The set walk, The Brothers' War batch 1 (2026-10-19): what the lead added while integrating —
 * Angelic Destiny (Draconic Destiny's return, which settled its old blocker) and Mishra's
 * Factory's missing third ability. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  keywords,
  lands,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Angelic Destiny", () => {
  it("makes a 4/4-bigger flying, first-striking Angel, and returns to hand as its host dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const destiny = toHand(game, "Angelic Destiny");
    a.chooseEnchantFn = () => bears;
    cast(game, destiny, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Angel"]));
    destroy(game, bears);
    expect(zone(game, destiny)).toBe("hand");
  });

  it("stays put if the card has left the graveyard before the trigger resolves (the ruling)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const destiny = toHand(game, "Angelic Destiny");
    a.chooseEnchantFn = () => bears;
    cast(game, destiny, { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    expect(zone(game, destiny)).toBe("graveyard");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(destiny)]);
    settle(game);
    expect(zone(game, destiny)).toBe("exile");
  });
});

describe("Mishra's Factory", () => {
  it("taps to give a target Assembly-Worker creature +1/+1, and can't target a non-Worker", () => {
    const { game } = table();
    const animated = spawn(game, "Mishra's Factory");
    const pumper = spawn(game, "Mishra's Factory");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(
      A,
      {
        kind: "animate",
        target: 0,
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Assembly-Worker"],
        duration: "end-of-turn",
      },
      [ref(animated)],
    );
    expect(pt(game, animated)).toEqual({ power: 2, toughness: 2 });
    expect(() => activate(game, pumper, 2, { targets: [ref(bears)] })).toThrow();
    activate(game, pumper, 2, { targets: [ref(animated)] });
    expect(pt(game, animated)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[pumper]?.tapped).toBe(true);
  });
});
