/**
 * The set walk, batch 55, part c (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

describe("The Great Mound", () => {
  it("makes a tapped, indestructible Vibranium token", () => {
    const { game } = table();
    const mound = spawn(game, "The Great Mound");
    lands(game, "Wastes", 3);
    activate(game, mound, 1);
    const [vibranium] = game.battlefield.filter((id) => game.state.objects[id].cardName === "Vibranium Token");
    expect(vibranium).toBeDefined();
    expect(game.state.objects[vibranium].tapped).toBe(true);
    expect(keywords(game, vibranium).has("indestructible")).toBe(true);
  });
});

describe("Shuri's Fabricator", () => {
  it("enters with two tapped Vibranium tokens, and returns an artifact card with a finality counter", () => {
    const { game } = table();
    const fabricator = game.debugSpawn("Shuri's Fabricator", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(tokensNamed(game, "Vibranium Token", A)).toBe(2);
    expect(
      game.battlefield
        .filter((id) => game.state.objects[id].cardName === "Vibranium Token")
        .every((id) => game.state.objects[id].tapped),
    ).toBe(true);

    toStep(game, "postcombat-main");
    const stone = toGraveyard(game, "Mind Stone");
    lands(game, "Wastes", 6);
    activate(game, fabricator, 0, { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("battlefield");
    expect(counters(game, stone, "finality")).toBe(1);
    destroy(game, stone);
    expect(zone(game, stone)).toBe("exile");
  });
});

describe("Unstable Molecule Suit", () => {
  it("equips only a commander for {2}, and gives +2/+2 and indestructible", () => {
    const { game } = table();
    const suit = spawn(game, "Unstable Molecule Suit");
    const bears = spawn(game, "Grizzly Bears");
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    lands(game, "Wastes", 6);
    expect(() => activate(game, suit, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, suit, 0, { targets: [ref(commander)] });
    expect(game.state.objects[suit].attachedTo).toBe(commander);
    expect(pt(game, commander)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, commander).has("indestructible")).toBe(true);
    // The plain Equip {4} reaches any creature.
    activate(game, suit, 1, { targets: [ref(bears)] });
    expect(game.state.objects[suit].attachedTo).toBe(bears);
  });
});

describe("Devil Dinosaur", () => {
  it("gives other Dinosaurs you control +1/+1 and hexproof, not itself or an opponent's", () => {
    const { game } = table();
    const devil = spawn(game, "Devil Dinosaur");
    const mine = spawn(game, "Ancient Brontodon");
    const theirs = spawn(game, "Ancient Brontodon", B);
    expect(pt(game, mine)).toEqual({ power: 10, toughness: 10 });
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    expect(pt(game, devil)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, devil).has("hexproof")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Director Nick Fury", () => {
  it("makes Hero spells cost {1} less", () => {
    const { game } = table();
    spawn(game, "Director Nick Fury");
    lands(game, "Plains", 2);
    const hero = toHand(game, "Amateur Hero");
    cast(game, hero);
    expect(zone(game, hero)).toBe("battlefield");
  });

  it("looks at four when you attack, a Hero to the hand and the rest to the bottom", () => {
    const { game, a } = table();
    const fury = spawn(game, "Director Nick Fury");
    const bears = toLibrary(game, "Grizzly Bears");
    const hero = toLibrary(game, "Amateur Hero");
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a, hero);
    attack(game, a, [fury]);
    expect(seen.offered).toEqual([hero]);
    expect(zone(game, hero)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3).sort()).toEqual([bears, giant, bolt].sort());
  });
});

describe("Winter Soldier, Reborn Avenger", () => {
  it("returns a creature card up to its power, a Hero with an extra +1/+1 counter", () => {
    const { game, a } = table();
    const soldier = spawn(game, "Winter Soldier, Reborn Avenger");
    const hero = toGraveyard(game, "Amateur Hero");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [hero]);
    attack(game, a, [soldier]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([hero, bears]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, hero)).toBe("battlefield");
    expect(counters(game, hero)).toBe(1);
  });

  it("returns a non-Hero without a counter", () => {
    const { game, a } = table();
    const soldier = spawn(game, "Winter Soldier, Reborn Avenger");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [soldier]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Ant-Man, Elusive Avenger", () => {
  it("can't be blocked by a creature with greater power", () => {
    const { game, a } = table();
    const antMan = spawn(game, "Ant-Man, Elusive Avenger");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const offer = blockOffer(game, a, [antMan]);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).toEqual([]);
    expect(canBlock(elves)).toEqual([antMan]);
  });

  it("creates a Treasure for each combat damage dealt to a player", () => {
    const { game, a } = table();
    const antMan = spawn(game, "Ant-Man, Elusive Avenger");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [
      ref(antMan),
    ]);
    attack(game, a, [antMan]);
    expect(life(game, B)).toBe(17);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });
});

describe("Avengers Quinjet", () => {
  it("as it enters, may put a Hero creature card from your hand onto the battlefield", () => {
    const { game, a } = table();
    const hero = toHand(game, "Amateur Hero");
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, hero);
    game.debugSpawn("Avengers Quinjet", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(seen.offered).toEqual([hero]);
    expect(zone(game, hero)).toBe("battlefield");
    expect(zone(game, bears)).toBe("hand");
  });

  it("as it attacks, may return a Hero creature card from your graveyard to your hand", () => {
    const { game, a } = table();
    const jet = spawn(game, "Avengers Quinjet");
    crewed(game, jet);
    const hero = toGraveyard(game, "Amateur Hero");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, hero);
    attack(game, a, [jet]);
    expect(zone(game, hero)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});

describe("N'Yami-Class Mother Ship", () => {
  it("may put a permanent card it looks at onto the battlefield", () => {
    const { game, a } = table();
    const ship = spawn(game, "N'Yami-Class Mother Ship");
    crewed(game, ship);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    attack(game, a, [ship]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("puts a nonpermanent card, or one it declines, into your hand", () => {
    const { game, a } = table();
    const ship = spawn(game, "N'Yami-Class Mother Ship");
    crewed(game, ship);
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a);
    attack(game, a, [ship]);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Daughter of the Deep", () => {
  it("makes a Merfolk on your second draw of the turn only", () => {
    const { game } = table();
    spawn(game, "Daughter of the Deep");
    // Alice drew her first card in her draw step.
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(1);
  });
});

describe("Mister Fantastic", () => {
  it("copies a triggered ability you control twice", () => {
    const { game } = table();
    const fantastic = spawn(game, "Mister Fantastic");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    game.debugSpawn("Amateur Hero", A, "battlefield", { announceEntry: true });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.priority.holder === A);
    const trigger = game.state.zones.shared.stack[0];
    activate(game, fantastic, 0, { targets: [ref(trigger)] });
    expect(life(game, A)).toBe(26);
  });

  it("draws at the beginning of combat only after a noncreature spell this turn", () => {
    const quiet = table();
    spawn(quiet.game, "Mister Fantastic");
    const before = hand(quiet.game).length;
    toStep(quiet.game, "begin-combat");
    settle(quiet.game);
    expect(hand(quiet.game).length).toBe(before);

    const { game } = table();
    spawn(game, "Mister Fantastic");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    const afterSpell = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(hand(game).length).toBe(afterSpell + 1);
  });
});

describe("Iron Lad, Young Avenger", () => {
  it("makes noncreature spells cost {1} less, and not creature spells", () => {
    const { game } = table();
    spawn(game, "Iron Lad, Young Avenger");
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination");
    cast(game, divination);
    expect(graveyard(game)).toContain(divination);
    const bears = toHand(game, "Hill Giant");
    lands(game, "Mountain", 3);
    expect(() => cast(game, bears)).toThrow();
  });
});
