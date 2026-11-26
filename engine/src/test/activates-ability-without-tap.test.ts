/**
 * The `activates-ability` trigger's `withoutTapCost`: "an ability without {T}
 * in its activation cost" (Powerleech, Artifact Possession) — read off the
 * `ability-activated` event's `tapCost`, a mana ability's too. One with {T}
 * taps the artifact, which their "becomes tapped" half sees instead, once.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, ref, spawn, table, toHand, toStep } from "./harness.js";

describe("Powerleech", () => {
  it("an opponent's equip (no {T}) gains you 1 life", () => {
    const { game } = table();
    spawn(game, "Powerleech", A);
    const splitter = spawn(game, "Bonesplitter", B);
    const bear = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    const before = life(game, A);
    activate(game, splitter, 0, { player: B, targets: [ref(bear)] });
    expect(life(game, A)).toBe(before + 1);
  });

  it("an opponent's {T} mana ability gains 1 life once, for the tap", () => {
    const { game } = table();
    spawn(game, "Powerleech", A);
    const stone = spawn(game, "Mind Stone", B);
    toStep(game, "precombat-main", B);
    const before = life(game, A);
    activate(game, stone, 0, { player: B });
    expect(life(game, A)).toBe(before + 1);
  });

  it("your own artifact's ability doesn't", () => {
    const { game } = table();
    spawn(game, "Powerleech", A);
    const splitter = spawn(game, "Bonesplitter", A);
    const bear = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 1, A);
    const before = life(game, A);
    activate(game, splitter, 0, { targets: [ref(bear)] });
    expect(life(game, A)).toBe(before);
  });
});

describe("Artifact Possession", () => {
  it("deals 2 to the enchanted artifact's controller when they activate its ability without {T}", () => {
    const { game } = table();
    const splitter = spawn(game, "Bonesplitter", B);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3, A);
    cast(game, toHand(game, "Artifact Possession"), { targets: [ref(splitter)] });
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    const before = life(game, B);
    activate(game, splitter, 0, { player: B, targets: [ref(bear)] });
    expect(life(game, B)).toBe(before - 2);
  });

  it("a {T} ability of it deals 2 once, for the tap", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Swamp", 3, A);
    cast(game, toHand(game, "Artifact Possession"), { targets: [ref(stone)] });
    toStep(game, "precombat-main", B);
    const before = life(game, B);
    activate(game, stone, 0, { player: B });
    expect(life(game, B)).toBe(before - 2);
  });

  it("another artifact's ability doesn't", () => {
    const { game } = table();
    // An artifact with no mana ability, so the equip's payment can't tap it.
    const stone = spawn(game, "Ornithopter", B);
    const splitter = spawn(game, "Bonesplitter", B);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3, A);
    cast(game, toHand(game, "Artifact Possession"), { targets: [ref(stone)] });
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    const before = life(game, B);
    activate(game, splitter, 0, { player: B, targets: [ref(bear)] });
    expect(life(game, B)).toBe(before);
  });
});
