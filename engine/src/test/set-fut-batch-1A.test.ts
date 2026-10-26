/**
 * Future Sight, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import { poolCounts } from "../mana.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Grinning Ignus", () => {
  it("returns to hand for {C}{C}{R} at sorcery speed", () => {
    const { game } = table();
    spawn(game, "Mountain");
    const ignus = spawn(game, "Grinning Ignus");
    activate(game, ignus);
    expect(zone(game, ignus)).toBe("hand");
    const pool = poolCounts(game.state.players[A].manaPool);
    expect(pool.C).toBe(2);
    expect(pool.R).toBe(1);
  });

  it("can't be activated during upkeep", () => {
    const { game } = table();
    spawn(game, "Mountain");
    const ignus = spawn(game, "Grinning Ignus");
    toStep(game, "upkeep");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: ignus, abilityIndex: 0, targets: [] })).not.toBeNull();
  });
});

describe("Pyromancer's Swath", () => {
  it("adds 2 to an instant's damage, and each end step its controller discards their hand", () => {
    const { game } = table();
    spawn(game, "Pyromancer's Swath");
    spawn(game, "Mountain");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    toStep(game, "end");
    settle(game);
    expect(hand(game)).toHaveLength(0);
  });
});

describe("Intervention Pact", () => {
  it("loses the game at the next upkeep when {1}{W}{W} isn't paid", () => {
    const { game } = table();
    cast(game, toHand(game, "Intervention Pact"));
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.players[A].hasLost).toBe(true);
  });
});

describe("Mistmeadow Skulk", () => {
  it("can't be targeted by a spell with mana value 3, but can by one with 1", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const skulk = spawn(game, "Mistmeadow Skulk", B);
    const bathe = toHand(game, "Bathe in Dragonfire");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bathe, targets: [ref(skulk)] })).not.toBeNull();
    cast(game, toHand(game, "Shock"), { targets: [ref(skulk)] });
    expect(zone(game, skulk)).toBe("graveyard");
  });
});

describe("Sliversmith", () => {
  it("discards a card for a Metallic Sliver", () => {
    const { game } = table();
    spawn(game, "Wastes");
    const smith = spawn(game, "Sliversmith");
    const before = hand(game).length;
    activate(game, smith);
    expect(hand(game)).toHaveLength(before - 1);
    expect(tokensNamed(game, "Metallic Sliver Token", A)).toBe(1);
  });
});

describe("Keldon Megaliths", () => {
  it("can't ping while you hold cards", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const megaliths = spawn(game, "Keldon Megaliths");
    expect(hand(game).length).toBeGreaterThan(0);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: megaliths, abilityIndex: 1, targets: [ref(B)] }),
    ).not.toBeNull();
  });
});

describe("Ravaging Riftwurm", () => {
  it("enters with two time counters, five when kicked", () => {
    const { game } = table();
    lands(game, "Forest", 10);
    const plain = toHand(game, "Ravaging Riftwurm");
    cast(game, plain);
    expect(counters(game, plain, "time")).toBe(2);
    const kicked = toHand(game, "Ravaging Riftwurm");
    cast(game, kicked, { kicked: true });
    expect(counters(game, kicked, "time")).toBe(5);
  });
});

describe("Augur il-Vec", () => {
  it("is sacrificed for 4 life only during your upkeep", () => {
    const { game } = table();
    const augur = spawn(game, "Augur il-Vec");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: augur, abilityIndex: 0, targets: [] })).not.toBeNull();
    toStep(game, "upkeep");
    activate(game, augur);
    expect(life(game)).toBe(24);
    expect(zone(game, augur)).toBe("graveyard");
  });
});

describe("Llanowar Augur", () => {
  it("pumps and grants trample during your upkeep", () => {
    const { game } = table();
    const augur = spawn(game, "Llanowar Augur");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    activate(game, augur, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Nix", () => {
  it("counters a spell no mana was spent on", () => {
    const { game } = table();
    spawn(game, "Island");
    const thopter = toHand(game, "Ornithopter");
    cast(game, thopter, { settle: false });
    cast(game, toHand(game, "Nix"), { targets: [ref(thopter)] });
    expect(zone(game, thopter)).toBe("graveyard");
  });

  it("doesn't counter a spell mana was spent on", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    spawn(game, "Island");
    cast(game, toHand(game, "Nix"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Pooling Venom", () => {
  it("destroys the enchanted land for {3}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const land = spawn(game, "Forest", B);
    const venom = toHand(game, "Pooling Venom");
    cast(game, venom, { targets: [ref(land)] });
    activate(game, venom);
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Leaden Fists", () => {
  it("gives +3/+3", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Leaden Fists"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Lumithread Field", () => {
  it("creatures you control get +0/+1", () => {
    const { game } = table();
    spawn(game, "Lumithread Field");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Skirk Ridge Exhumer", () => {
  it("makes a Festering Goblin whose death shrinks a target creature", () => {
    const { game, a } = table();
    spawn(game, "Swamp");
    const exhumer = spawn(game, "Skirk Ridge Exhumer");
    activate(game, exhumer);
    const [goblin] = named(game, "Festering Goblin Token");
    expect(goblin).toBeDefined();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    destroy(game, goblin);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Thunderblade Charge", () => {
  it("is paid for and cast from the graveyard when your creatures connect", () => {
    const { game, a } = table();
    const charge = toGraveyard(game, "Thunderblade Charge");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    pickModes(a, 0);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === charge);
      return way === undefined ? null : { type: "cast-spell", player: A, card: charge, targets: [ref(B)], via: way.via, free: true };
    };
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, charge)).toBe("graveyard");
  });
});
