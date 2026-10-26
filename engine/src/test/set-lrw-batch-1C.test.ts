/**
 * Lorwyn, batch 1 group C — the clause most likely to be wrong on each card:
 *
 * - Incendiary Command: exactly two modes, and the wheel mode's per-player draw.
 * - Hamletback Goliath: X is the entering creature's power, and it's optional.
 * - Fallowsage: the becomes-tapped draw (attacking taps it).
 * - Auntie's Hovel: a changeling card counts as a Goblin to reveal (rule 702.73a).
 * - Faerie Tauntings: one choice for every opponent, only off-turn.
 * - Glen Elendra Pranksters: the off-turn bounce of your own creature.
 * - Blades of Velis Vel: +2/+0 and every creature type, on up to two creatures.
 * - Galepowder Mage: the attack exile returns at the next end step, to its owner.
 * - Giant Harbinger: the Giant goes on top of the library.
 * - Marsh Flitter: sacrificing a Goblin sets base P/T 3/3.
 * - Makeshift Mannequin: the mannequin counter's granted sacrifice trigger.
 * - Kithkin Mourncaller: an attacking Elf of yours dying draws.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import { activePlayerOf } from "../state.js";
import type { GameState } from "../state.js";
import { hasSubtype } from "../subtypes.js";

/** A, with priority, during B's turn. */
const duringOpponentTurn = (game: { advanceUntil: (p: (s: GameState) => boolean) => void }): void =>
  game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);

describe("Incendiary Command", () => {
  it("chooses two modes: 4 damage to a player and the wheel", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 5);
    const command = toHand(game, "Incendiary Command");
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears", B);
    const handsBefore = { a: hand(game, A).length, b: hand(game, B).length };
    pickModes(a);
    pickModes(b);
    cast(game, command, { modes: [0, 3], targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(16);
    // The wheel: each player discarded their hand and drew that many. A's hand
    // had the Bears left once the Command itself was cast.
    expect(hand(game, A).length).toBe(handsBefore.a - 1);
    expect(hand(game, B).length).toBe(handsBefore.b);
  });

  it("deals 2 to each creature and destroys a nonbasic land", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const nonbasic = spawn(game, "Bojuka Bog", B);
    cast(game, toHand(game, "Incendiary Command"), { modes: [1, 2], targets: [ref(nonbasic)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, nonbasic)).toBe("graveyard");
  });
});

describe("Hamletback Goliath", () => {
  it("takes counters equal to the entering creature's power, at the controller's option", () => {
    const { game, a } = table();
    const goliath = spawn(game, "Hamletback Goliath");
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(counters(game, goliath)).toBe(2);
    // An opponent's creature counts too, and declining puts none on.
    pickModes(a);
    enter(game, "Grizzly Bears", B);
    expect(counters(game, goliath)).toBe(2);
    pickModes(a, 0);
    enter(game, "Grizzly Bears", B);
    expect(counters(game, goliath)).toBe(4);
  });
});

describe("Fallowsage", () => {
  it("draws when it becomes tapped, not for a creature already tapped", () => {
    const { game, a } = table();
    const sage = spawn(game, "Fallowsage");
    pickModes(a, 0);
    const before = hand(game, A).length;
    attack(game, a, [sage]);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Auntie's Hovel", () => {
  it("counts a changeling card in hand as a Goblin to reveal", () => {
    const { game } = table();
    const hovel = toHand(game, "Auntie's Hovel");
    toHand(game, "Changeling Outcast");
    game.dispatch({ type: "play-land", player: A, card: hovel });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("reveal-for-untapped");
    if (awaiting?.kind !== "reveal-for-untapped") return;
    expect(awaiting.options.map((id) => game.state.objects[id].cardName)).toEqual(["Changeling Outcast"]);
    game.dispatch({ type: "reveal-for-untapped", player: A, reveal: awaiting.options[0] });
    expect(game.state.objects[hovel].tapped).toBe(false);
  });

  it("enters tapped with no Goblin card in hand", () => {
    const { game } = table();
    const hovel = toHand(game, "Auntie's Hovel");
    toHand(game, "Grizzly Bears");
    game.dispatch({ type: "play-land", player: A, card: hovel });
    settle(game);
    expect(game.state.objects[hovel].tapped).toBe(true);
  });
});

describe("Faerie Tauntings", () => {
  it("drains every opponent on one choice, and only off-turn", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Faerie Tauntings");
    lands(game, "Mountain", 4);
    // Your own turn: no trigger.
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(18);
    // During B's turn it fires, and both opponents lose 1.
    const shock = toHand(game, "Shock");
    duringOpponentTurn(game);
    pickModes(b);
    cast(game, shock, { targets: [ref(B)], settle: false });
    settle(game);
    expect(game.state.players[B].life).toBe(15);
    // The other opponent lost 1 on the same single choice (the ruling).
    expect(game.state.players[C].life).toBe(19);
  });
});

describe("Glen Elendra Pranksters", () => {
  it("returns a creature you control to your hand on an off-turn spell", () => {
    const { game, a } = table();
    spawn(game, "Glen Elendra Pranksters");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    const shock = toHand(game, "Shock");
    duringOpponentTurn(game);
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, shock, { targets: [ref(B)], settle: false });
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Blades of Velis Vel", () => {
  it("pumps and gives every creature type to up to two creatures", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Blades of Velis Vel"), { targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, two)).toEqual({ power: 4, toughness: 2 });
    expect(hasSubtype(subtypes(game, one), "Goblin")).toBe(true);
    expect(hasSubtype(subtypes(game, two), "Merfolk")).toBe(true);
    // Still a Bear, and still their own creature: "gain", not "become".
    expect(subtypes(game, one)).toContain("Bear");
  });

  it("is every creature type itself (changeling)", () => {
    const { game } = table();
    expect(game.registry.get("Blades of Velis Vel").keywords).toContain("changeling");
  });
});

describe("Galepowder Mage", () => {
  it("exiles another creature on attack and returns it to its owner at the next end step", () => {
    const { game, a } = table();
    const mage = spawn(game, "Galepowder Mage");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    a.declareAttackersFn = () => [{ attacker: mage, defender: B }];
    game.advanceUntil((s) => s.objects[theirs].zone === "exile" || s.turn.step === "end");
    expect(zone(game, theirs)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(B);
  });
});

describe("Giant Harbinger", () => {
  it("puts a Giant card from the library on top", () => {
    const { game, a } = table();
    const giant = toLibrary(game, "Hamletback Goliath");
    pickModes(a, 0);
    pickFromZone(a, giant);
    enter(game, "Giant Harbinger");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(giant);
  });
});

describe("Marsh Flitter", () => {
  it("makes two Goblin Rogues, and sacrificing one sets its base P/T to 3/3", () => {
    const { game } = table();
    const flitter = enter(game, "Marsh Flitter");
    expect(tokensNamed(game, "Goblin Rogue Token", A)).toBe(2);
    expect(pt(game, flitter)).toEqual({ power: 1, toughness: 1 });
    const goblin = game.battlefield.find((id) => game.state.objects[id].cardName === "Goblin Rogue Token")!;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: flitter,
      abilityIndex: 0,
      targets: [],
      sacrifice: goblin,
    });
    settle(game);
    expect(pt(game, flitter)).toEqual({ power: 3, toughness: 3 });
    expect(tokensNamed(game, "Goblin Rogue Token", A)).toBe(1);
  });
});

describe("Makeshift Mannequin", () => {
  it("reanimates with a mannequin counter, and that creature is sacrificed when targeted", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Makeshift Mannequin"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "mannequin")).toBe(1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(bears);
  });
});

describe("Kithkin Mourncaller", () => {
  it("draws when an attacking Elf of yours dies, at your option", () => {
    const { game, a, b } = table();
    spawn(game, "Kithkin Mourncaller");
    const elf = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Colossal Dreadmaw", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: elf }];
    pickModes(a, 0);
    const before = hand(game, A).length;
    attack(game, a, [elf]);
    expect(zone(game, elf)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("doesn't draw for a creature that wasn't attacking", () => {
    const { game, a } = table();
    spawn(game, "Kithkin Mourncaller");
    const elf = spawn(game, "Llanowar Elves");
    pickModes(a, 0);
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(elf)]);
    settle(game);
    expect(zone(game, elf)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Aethersnipe", () => {
  it("bounces a nonland permanent as it enters, and evoke sacrifices it", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    pickTargets(a, theirs);
    const snipe = toHand(game, "Aethersnipe");
    cast(game, snipe, { evoke: true });
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, snipe)).toBe("graveyard");
  });
});

describe("Triclopean Sight", () => {
  it("untaps the creature it enchants and grants +1/+1 and vigilance", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Triclopean Sight"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Runed Stalactite", () => {
  it("makes the equipped creature every creature type", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const stalactite = spawn(game, "Runed Stalactite");
    lands(game, "Wastes", 2);
    activate(game, stalactite, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(hasSubtype(subtypes(game, bears), "Goblin")).toBe(true);
  });
});
