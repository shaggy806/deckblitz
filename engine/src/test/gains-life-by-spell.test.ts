/**
 * "Whenever a white instant or sorcery spell causes you to gain life"
 * (Firesong and Sunspeaker): `gains-life`'s `bySpell`, read off the
 * `life-changed` event's `bySpell` — the spell resolving as the life was
 * gained (`GameState.resolvingSpell`): its effect's gain, lifelink damage its
 * effect dealt, never a triggered ability of the card nor a mana ability
 * activated to pay for something it asks (the rulings).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, nextTurn, pickModes, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Firesong and Sunspeaker", () => {
  it("a white instant's gain deals 3 damage to target creature or player", () => {
    const { game, a } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Plains", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Revitalize"));
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(17);
  });

  it("a white sorcery's gain, at a creature", () => {
    const { game, a } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Chaplain's Blessing"));
    expect(life(game, A)).toBe(25);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("gives red instants lifelink, and a red spell's gain isn't a white spell's", () => {
    const { game } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(23);
    // Only the Bolt: nothing triggered.
    expect(life(game, B)).toBe(17);
  });

  it("a red and white spell that deals damage and gains life triggers twice", () => {
    const { game, a } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    // 3 from lifelink and 3 from the instruction, two gains.
    expect(life(game, A)).toBe(26);
    expect(life(game, B)).toBe(20 - 3 - 3 - 3);
  });

  it("an opponent's white spell that makes you gain life triggers it", () => {
    const { game, a } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Plains", 2, B);
    nextTurn(game);
    pickTargets(a, B);
    cast(game, toHand(game, "Rest for the Weary", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(24);
    expect(life(game, B)).toBe(17);
  });

  it("not a triggered ability of a white card (Renewed Faith cycled), nor a gain no spell caused", () => {
    const { game, a } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Plains", 2);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Renewed Faith") });
    settle(game);
    expect(life(game, A)).toBe(22);
    // A mana ability's gain outside any spell.
    const talisman = spawn(game, "Pristine Talisman");
    activate(game, talisman, 0);
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(20);
  });

  it("not a mana ability activated to pay what a white spell asks as it resolves", () => {
    const { game, a } = table();
    spawn(game, "Firesong and Sunspeaker");
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    spawn(game, "Pristine Talisman");
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    // Mana Tithe on its own spell: the {1} paid with Pristine Talisman, whose
    // life is its own mana ability's.
    pickModes(a, 0);
    cast(game, toHand(game, "Mana Tithe"), { targets: [ref(opt)] });
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(20);
    expect(zone(game, opt)).toBe("graveyard");
  });
});
