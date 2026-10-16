/**
 * Set walk batch 90, part c (2026-10-16): Fallout (PIP) and Ravnica: Clue Edition (CLU), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
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
  watchTargets,
  zone,
} from "./harness.js";

const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const makeToken = (game: Game, name: string, player: PlayerId = A, count = 1): void => {
  game.debugApplyEffect(player, { kind: "create-token", token: name, count });
  settle(game);
};
const canActivate = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((o) => o.kind === "activate-ability" && o.source === source);

describe("Boomer Scrapper", () => {
  it("entering and attacking each cost 1 life and make a Junk token", () => {
    const { game, a } = table();
    const scrapper = enter(game, "Boomer Scrapper");
    expect(life(game)).toBe(19);
    expect(tokensNamed(game, "Junk Token", A)).toBe(1);
    attack(game, a, [scrapper]);
    expect(life(game)).toBe(18);
    expect(tokensNamed(game, "Junk Token", A)).toBe(2);
  });

  it("each token of yours leaving gives it a counter — a stack counting every token; an opponent's doesn't", () => {
    const { game } = table();
    const scrapper = spawn(game, "Boomer Scrapper");
    makeToken(game, "Human Soldier Token", A, 3);
    makeToken(game, "Human Soldier Token", B, 1);
    game.debugApplyEffect(B, { kind: "return-to-hand-all", filter: { token: true } }, []);
    settle(game);
    expect(tokensNamed(game, "Human Soldier Token")).toBe(0);
    expect(counters(game, scrapper)).toBe(3);
  });

  it("a nontoken creature leaving doesn't count", () => {
    const { game } = table();
    const scrapper = spawn(game, "Boomer Scrapper");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, scrapper)).toBe(0);
  });
});

describe("White Glove Gourmand", () => {
  it("makes two Human Soldiers, and a Food at your end step after another Human of yours died", () => {
    const { game } = table();
    enter(game, "White Glove Gourmand");
    const soldiers = tokensOf(game, "Human Soldier Token");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(2);
    destroy(game, soldiers[0]);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("no Food when no Human of yours died — a non-Human, or an opponent's Human, doesn't count", () => {
    const { game } = table();
    spawn(game, "White Glove Gourmand");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Elite Vanguard", B));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("the Human needn't have died while the Gourmand was there (the ruling)", () => {
    const { game } = table();
    destroy(game, spawn(game, "Elite Vanguard"));
    spawn(game, "White Glove Gourmand");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Super Mutant Scavenger", () => {
  it("returns up to one Aura or Equipment card from your graveyard as it enters and as it dies", () => {
    const { game, a } = table();
    const aura = toGraveyard(game, "Pacifism");
    const equipment = toGraveyard(game, "Bonesplitter");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [aura]);
    const scavenger = enter(game, "Super Mutant Scavenger");
    expect(seen.offered[0]).toContain(equipment);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, aura)).toBe("hand");
    pickTargets(a, equipment);
    destroy(game, scavenger);
    expect(zone(game, equipment)).toBe("hand");
  });

  it("the target is optional", () => {
    const { game, a } = table();
    const aura = toGraveyard(game, "Pacifism");
    pickTargets(a, null);
    enter(game, "Super Mutant Scavenger");
    expect(zone(game, aura)).toBe("graveyard");
  });
});

describe("Ian the Reckless", () => {
  it("unmodified, its attack doesn't trigger", () => {
    const { game, a } = table();
    const ian = spawn(game, "Ian the Reckless");
    const seen = watchTargets(a, () => [B]);
    pickModes(a, 0);
    attack(game, a, [ian]);
    expect(seen.asked).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });

  it("modified, it may deal damage equal to its power to you and any target", () => {
    const { game, a } = table();
    const ian = spawn(game, "Ian the Reckless");
    game.state.objects[ian].counters["+1/+1"] = 1;
    pickTargets(a, B);
    pickModes(a, 0);
    attack(game, a, [ian]);
    // 3 to alice and 3 to bob from the trigger, then 3 combat damage to bob.
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(14);
  });

  it("declining deals nothing", () => {
    const { game, a } = table();
    const ian = spawn(game, "Ian the Reckless");
    game.state.objects[ian].counters["+1/+1"] = 1;
    pickTargets(a, B);
    pickModes(a);
    attack(game, a, [ian]);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
  });
});

describe("Vernal Sovereign", () => {
  it("makes an Elemental as it enters and as it attacks, each the size of your creature count", () => {
    const { game, a } = table();
    const sovereign = enter(game, "Vernal Sovereign");
    const [first] = tokensOf(game, "Elemental Token (Vernal Sovereign)");
    expect(pt(game, first)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [sovereign]);
    expect(tokensNamed(game, "Elemental Token (Vernal Sovereign)", A)).toBe(2);
    expect(pt(game, first)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Emissary Green", () => {
  it("two Treasures per profit vote, a +1/+1 counter on each of your creatures per security vote", () => {
    const { game, a, b } = table();
    const emissary = spawn(game, "Emissary Green");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickModes(b, 1);
    attack(game, a, [emissary]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(counters(game, emissary)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });

  it("all profit: four Treasures and no counters", () => {
    const { game, a, b } = table();
    const emissary = spawn(game, "Emissary Green");
    pickModes(a, 0);
    pickModes(b, 0);
    attack(game, a, [emissary]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
    expect(counters(game, emissary)).toBe(0);
  });
});

describe("Lavinia, Foil to Conspiracy", () => {
  it("investigates on your second spell each turn only", () => {
    const { game } = table();
    spawn(game, "Lavinia, Foil to Conspiracy");
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("taps for {C}{C} only during an opponent's turn", () => {
    const { game } = table();
    const lavinia = spawn(game, "Lavinia, Foil to Conspiracy");
    expect(canActivate(game, lavinia)).toBe(false);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);
    expect(canActivate(game, lavinia)).toBe(true);
    activate(game, lavinia, 0, { settle: false });
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C", "C"]);
  });
});

describe("Lonis, Genetics Expert", () => {
  it("evolves, and investigates once per +1/+1 counter put on it", () => {
    const { game } = table();
    const lonis = spawn(game, "Lonis, Genetics Expert");
    enter(game, "Grizzly Bears");
    expect(counters(game, lonis)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(lonis)]);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(4);
  });

  it("sacrificing a Clue puts a +1/+1 counter on another target creature you control", () => {
    const { game, a } = table();
    const lonis = spawn(game, "Lonis, Genetics Expert");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    makeToken(game, "Clue Token");
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    const seen = watchTargets(a, () => [bears]);
    activate(game, tokensOf(game, "Clue Token")[0]);
    expect(seen.offered[0]).toContain(lions);
    expect(seen.offered[0]).not.toContain(lonis);
    expect(counters(game, bears)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Conclave Evangelist", () => {
  it("myriad copies attack the other opponents, and each copy dealing damage makes a lasting copy", () => {
    const { game, a } = table({ players: 3 });
    const evangelist = spawn(game, "Conclave Evangelist");
    pickModes(a, 0);
    attack(game, a, [evangelist]);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(16);
    // The myriad token is exiled at end of combat; the two copies made by
    // combat damage stay (the ruling).
    const copies = named(game, "Conclave Evangelist", A).filter((id) => id !== evangelist);
    expect(copies.length).toBe(2);
    expect(copies.every((id) => game.state.objects[id].isToken === true)).toBe(true);
  });
});

describe("Herald of Ilharg", () => {
  it("two counters per creature spell; a spell of mana value 5+ also deals its counters to each opponent", () => {
    const { game } = table({ players: 3 });
    const herald = spawn(game, "Herald of Ilharg");
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, herald)).toBe(2);
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Craw Wurm"));
    expect(counters(game, herald)).toBe(4);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(16);
    expect(life(game, A)).toBe(20);
  });

  it("counts every counter on it, of any kind, and resolves even if the spell is countered", () => {
    const { game } = table();
    const herald = spawn(game, "Herald of Ilharg");
    game.state.objects[herald].counters.oil = 1;
    lands(game, "Forest", 6);
    const wurm = toHand(game, "Craw Wurm");
    cast(game, wurm, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(wurm)]);
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Commander Mustard", () => {
  it("other Soldiers you control have vigilance, trample and haste", () => {
    const { game } = table();
    const mustard = spawn(game, "Commander Mustard");
    const vanguard = spawn(game, "Elite Vanguard");
    const theirs = spawn(game, "Elite Vanguard", B);
    const bears = spawn(game, "Grizzly Bears");
    for (const k of ["vigilance", "trample", "haste"]) expect(keywords(game, vanguard).has(k)).toBe(true);
    expect(keywords(game, mustard).has("trample")).toBe(false);
    expect(keywords(game, mustard).has("haste")).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("each activation gives your Soldiers another 1-damage attack trigger until end of turn", () => {
    const { game, a } = table();
    const mustard = spawn(game, "Commander Mustard");
    const vanguard = spawn(game, "Elite Vanguard");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    lands(game, "Wastes", 4);
    activate(game, mustard);
    activate(game, mustard);
    attack(game, a, [vanguard]);
    // Two triggers for 1 each, then 2 combat damage.
    expect(life(game, B)).toBe(16);
  });

  it("a Soldier that arrives after it resolves doesn't gain it (rule 611.2c)", () => {
    const { game, a } = table();
    const mustard = spawn(game, "Commander Mustard");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 2);
    activate(game, mustard);
    const vanguard = spawn(game, "Elite Vanguard");
    attack(game, a, [vanguard]);
    expect(life(game, B)).toBe(18);
  });
});
