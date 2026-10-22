/**
 * Amonkhet, group K: the Gods' restrictions, exert triggers, aftermath, the
 * graveyard shuffle and the rest — the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Kefnet the Mindful", () => {
  it("draws, then may return a land you control to its owner's hand", () => {
    const { game, a } = table();
    const kefnet = spawn(game, "Kefnet the Mindful");
    lands(game, "Island", 4);
    const extra = spawn(game, "Forest");
    const before = hand(game).length;
    pickPermanents(a, extra);
    activate(game, kefnet, 0);
    expect(zone(game, extra)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
  });

  it("attacks with seven or more cards in hand", () => {
    const { game, a } = table();
    const kefnet = spawn(game, "Kefnet the Mindful");
    expect(hand(game).length).toBeGreaterThanOrEqual(7);
    attack(game, a, [kefnet]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Bontu the Glorified", () => {
  it("can't attack until a creature died under your control this turn", () => {
    const { game, a } = table();
    const bontu = spawn(game, "Bontu the Glorified");
    // Bob has a would-be blocker, so he'd be asked if Bontu could attack.
    spawn(game, "Hill Giant", B);
    expect(() => blockOffer(game, a, [bontu])).toThrow();
  });

  it("sacrificing another creature drains each opponent and lets Bontu attack", () => {
    const { game, a } = table();
    const bontu = spawn(game, "Bontu the Glorified");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    game.dispatch({ type: "activate-ability", player: A, source: bontu, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    attack(game, a, [bontu]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Honored Crop-Captain", () => {
  it("other attacking creatures get +1/+0", () => {
    const { game, a } = table();
    const captain = spawn(game, "Honored Crop-Captain");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [captain, bears]);
    expect(life(game, B)).toBe(20 - 3 - 3);
  });
});

describe("Ahn-Crop Crasher", () => {
  it("exerted as it attacks, target creature can't block", () => {
    const { game, a } = table();
    const crasher = spawn(game, "Ahn-Crop Crasher");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    blockOffer(game, a, [crasher]);
    expect(() =>
      game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: crasher }] }),
    ).toThrow(/can't block/);
  });
});

describe("Glory-Bound Initiate", () => {
  it("exerted, gets +1/+3 and lifelink", () => {
    const { game, a } = table();
    const initiate = spawn(game, "Glory-Bound Initiate");
    pickModes(a, 0);
    attack(game, a, [initiate]);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
    expect(pt(game, initiate)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Cryptic Serpent", () => {
  it("costs {1} less for each instant and sorcery card in your graveyard, never below {U}{U}", () => {
    const { game } = table();
    lands(game, "Island", 2);
    for (let i = 0; i < 4; i++) toGraveyard(game, "Shock");
    toGraveyard(game, "Grizzly Bears");
    const serpent = toHand(game, "Cryptic Serpent");
    expect(() => cast(game, serpent)).toThrow();
    toGraveyard(game, "Tome Scour");
    cast(game, serpent);
    expect(zone(game, serpent)).toBe("battlefield");
  });
});

describe("Temmet, Vizier of Naktamun", () => {
  it("at the beginning of combat, a creature token you control gets +1/+1 and can't be blocked", () => {
    const { game, a } = table();
    spawn(game, "Temmet, Vizier of Naktamun");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    const [token] = named(game, "Soldier Token", A);
    pickTargets(a, token);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, token).has("unblockable")).toBe(true);
  });
});

describe("Soulstinger", () => {
  it("dying, puts a -1/-1 counter on target creature for each -1/-1 counter it had", () => {
    const { game, a } = table();
    // Its only creature, so the enters trigger's default target is itself.
    const stinger = enter(game, "Soulstinger");
    expect(counters(game, stinger, "-1/-1")).toBe(2);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    destroy(game, stinger);
    expect(counters(game, giant, "-1/-1")).toBe(2);
  });
});

describe("Seeker of Insight", () => {
  it("loots only after you've cast a noncreature spell this turn", () => {
    const { game } = table();
    const seeker = spawn(game, "Seeker of Insight");
    expect(() => activate(game, seeker, 0)).toThrow();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const before = graveyard(game).length;
    activate(game, seeker, 0);
    expect(graveyard(game).length).toBe(before + 1);
  });
});

describe("Trial of Strength", () => {
  it("makes a 4/2 Beast, and returns to hand when a Cartouche you control enters", () => {
    const { game } = table();
    const trial = enter(game, "Trial of Strength");
    expect(named(game, "4/2 Beast Token", A)).toHaveLength(1);
    enter(game, "Cartouche of Ambition");
    expect(zone(game, trial)).toBe("hand");
  });
});

describe("Road // Ruin", () => {
  it("Ruin, from the graveyard, deals damage equal to the lands you control, then is exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    const target = spawn(game, "Soulstinger", B);
    const card = toGraveyard(game, "Road // Ruin");
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Ulamog, the Infinite Gyre", () => {
  it("casting it destroys target permanent", () => {
    const { game, a } = table();
    lands(game, "Wastes", 11);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Ulamog, the Infinite Gyre"));
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("put into a graveyard from anywhere, its owner shuffles their graveyard into their library", () => {
    const { game } = table();
    lands(game, "Island", 1);
    toGraveyard(game, "Grizzly Bears");
    const ulamog = toLibrary(game, "Ulamog, the Infinite Gyre");
    cast(game, toHand(game, "Tome Scour"), { targets: [ref(A)] });
    expect(zone(game, ulamog)).toBe("library");
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Elixir of Immortality", () => {
  it("gains 5 life and shuffles itself and your graveyard into your library", () => {
    const { game } = table();
    const elixir = spawn(game, "Elixir of Immortality");
    lands(game, "Wastes", 2);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock");
    activate(game, elixir, 0);
    expect(life(game)).toBe(25);
    expect(zone(game, elixir)).toBe("library");
    expect(graveyard(game)).toHaveLength(0);
  });
});
