/**
 * A delayed trigger that watches named permanents for a set duration: the
 * `delayed-trigger` effect's `at: { whenever, watching, until, once,
 * orLosesControl }` (rule 603.7). `"self"` in its `whenever` reads as the
 * permanents `watching` names, each for this stint on the battlefield (rule
 * 400.7), so any trigger that can say "self" can be watched: Paladin of
 * Prahv's "whenever target creature deals damage this turn", Arcbond's "is
 * dealt damage", Tamiyo, Field Researcher's "either of those creatures … until
 * your next turn". Coffin Queen's "when this creature becomes untapped or you
 * lose control of this creature" has no duration and fires once (603.7b).
 * Plague Reaver's return at a chosen opponent's next upkeep is `whose`, which
 * needed nothing new.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  hand,
  lands,
  life,
  loyalty,
  nextTurn,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** An upkeep board with a Paladin of Prahv to forecast from, on this creature. */
function forecastOn(watchedName: string, whose: typeof A = A) {
  const seats = table({ step: "upkeep" });
  lands(seats.game, "Plains", 2);
  const paladin = toHand(seats.game, "Paladin of Prahv");
  const watched = spawn(seats.game, watchedName, whose);
  activate(seats.game, paladin, 0, { targets: [ref(watched)] });
  return { ...seats, paladin, watched };
}

describe("whenever target creature deals damage this turn (Paladin of Prahv)", () => {
  it("gains that much life for its own damage", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Paladin of Prahv");
    attack(game, a, [paladin]);
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(17);
  });

  it("forecast: that creature's damage only, this turn only", () => {
    const { game, a, paladin, watched } = forecastOn("Hill Giant");
    expect(zone(game, paladin)).toBe("hand");
    const other = spawn(game, "Grizzly Bears");
    attack(game, a, [watched, other]);
    expect(life(game, B)).toBe(15);
    // 3 from the Giant, none for the Bears' 2.
    expect(life(game, A)).toBe(23);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [watched]);
    expect(life(game, B)).toBe(12);
    expect(life(game, A)).toBe(23);
  });

  it("noncombat damage counts, even a creature's sacrificed as the cost (rule 608.2h)", () => {
    const { game, watched } = forecastOn("Mogg Fanatic");
    activate(game, watched, 0, { targets: [ref(B)] });
    expect(zone(game, watched)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("an opponent's creature gains the activator the life, not its controller", () => {
    const { game, a, b, watched } = forecastOn("Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: watched, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(20);
  });

  it("a creature that left and came back is a new object, and isn't watched (rule 400.7)", () => {
    const { game, a, watched } = forecastOn("Raging Goblin");
    toStep(game, "precombat-main");
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(watched)] });
    expect(zone(game, watched)).toBe("hand");
    cast(game, watched);
    expect(zone(game, watched)).toBe("battlefield");
    attack(game, a, [watched]);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("whenever that creature is dealt damage this turn (Arcbond)", () => {
  it("it deals that much to each other creature and each player, even as it dies", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Arcbond"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });

  it("only that creature's being dealt damage fires it", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Arcbond"), { targets: [ref(giant)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(other)] });
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});

describe("until your next turn, whenever either of those creatures … (Tamiyo, Field Researcher)", () => {
  it("draws for each watched creature's combat damage, until her next turn begins", () => {
    const { game, a } = table();
    const tamiyo = spawn(game, "Tamiyo, Field Researcher");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    const other = spawn(game, "Llanowar Elves");
    loyalty(game, tamiyo, 1, { targets: [ref(one), ref(two)] });
    const before = hand(game).length;
    attack(game, a, [one, two, other]);
    expect(hand(game).length).toBe(before + 2);
    // It outlasts the turn: bob's creature isn't watched, but her Giant blocks.
    nextTurn(game);
    expect(game.state.delayedTriggers.some((t) => typeof t.at === "object" && "whenever" in t.at)).toBe(true);
    // Her next turn begins, and it's over.
    nextTurn(game);
    expect(game.state.delayedTriggers.some((t) => typeof t.at === "object" && "whenever" in t.at)).toBe(false);
  });

  it("a creature its controller's opponent controls draws Tamiyo's controller the card", () => {
    const { game, b } = table();
    const tamiyo = spawn(game, "Tamiyo, Field Researcher");
    const theirs = spawn(game, "Hill Giant", B);
    loyalty(game, tamiyo, 1, { targets: [ref(theirs), null] });
    nextTurn(game);
    const mine = hand(game).length;
    const theirHand = hand(game, B).length;
    attack(game, b, [theirs], A);
    expect(hand(game).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirHand);
  });

  it("no creatures chosen watches nothing", () => {
    const { game } = table();
    const tamiyo = spawn(game, "Tamiyo, Field Researcher");
    loyalty(game, tamiyo, 1, { targets: [null, null] });
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("−2 keeps two permanents tapped; −7 draws three and makes spells from hand free", () => {
    const { game } = table();
    const tamiyo = spawn(game, "Tamiyo, Field Researcher");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Sol Ring", B);
    loyalty(game, tamiyo, -2, { targets: [ref(one), ref(two)] });
    expect(game.state.objects[one].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
    nextTurn(game);
    const before = hand(game).length;
    loyalty(game, tamiyo, -7, { atLeast: 7 });
    expect(hand(game).length).toBe(before + 3);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant, { altCost: true });
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("When this creature becomes untapped or you lose control of it (Coffin Queen)", () => {
  /** Alice's Queen, activated on the Bears in bob's graveyard. */
  function reanimated() {
    const seats = table();
    lands(seats.game, "Swamp", 3);
    const queen = spawn(seats.game, "Coffin Queen");
    const bears = seats.game.debugSpawn("Grizzly Bears", B, "graveyard");
    activate(seats.game, queen, 0, { targets: [ref(bears)] });
    expect(zone(seats.game, bears)).toBe("battlefield");
    expect(controller(seats.game, bears)).toBe(A);
    return { ...seats, queen, bears };
  }

  it("while she stays tapped, turn after turn, the creature stays; when she untaps it's exiled", () => {
    const { game, a, queen, bears } = reanimated();
    pickPermanents(a, queen); // kept tapped through alice's next untap step
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[queen].tapped).toBe(true);
    pickPermanents(a); // let her untap
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[queen].tapped).toBe(false);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("any untap fires it, and only once", () => {
    const { game, a, queen, bears } = reanimated();
    lands(game, "Island", 1);
    pickModes(a, 1);
    cast(game, toHand(game, "Twiddle"), { targets: [ref(queen)] });
    expect(game.state.objects[queen].tapped).toBe(false);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("she dies: you've lost control of her, and the creature is exiled", () => {
    const { game, queen, bears } = reanimated();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(queen)] });
    expect(zone(game, queen)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("the creature left first: the tracking ends, and it stays where it went (its ruling)", () => {
    const { game, queen, bears } = reanimated();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Terror"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    cast(game, toHand(game, "Shock"), { targets: [ref(queen)] });
    expect(zone(game, queen)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("another player gains control of her: the creature is exiled", () => {
    const { game, queen, bears } = reanimated();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Harmless Offering"), { targets: [ref(B), ref(queen)] });
    expect(controller(game, queen)).toBe(B);
    expect(zone(game, bears)).toBe("exile");
  });

  it("she left before it resolved: the delayed ability can never fire, so nothing is set up", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const queen = spawn(game, "Coffin Queen");
    const bears = game.debugSpawn("Grizzly Bears", B, "graveyard");
    activate(game, queen, 0, { targets: [ref(bears)], settle: false });
    cast(game, toHand(game, "Shock"), { targets: [ref(queen)], settle: false });
    settle(game);
    expect(zone(game, queen)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});

describe("Plague Reaver", () => {
  it("sacrifices each other creature you control at your end step, and only yours", () => {
    const { game } = table();
    const reaver = spawn(game, "Plague Reaver");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    toStep(game, "end");
    settle(game);
    expect(zone(game, reaver)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("returns at the chosen opponent's next upkeep, under their control, not anyone else's", () => {
    const { game, a } = table({ players: 3 });
    const reaver = spawn(game, "Plague Reaver");
    const discards = [toHand(game, "Wastes"), toHand(game, "Wastes")];
    a.chooseDiscardsFn = () => discards;
    activate(game, reaver, 0, { targets: [ref(C)] });
    expect(zone(game, reaver)).toBe("graveyard");
    expect(discards.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    nextTurn(game, "upkeep"); // bob's
    settle(game);
    expect(zone(game, reaver)).toBe("graveyard");
    nextTurn(game, "upkeep"); // carol's
    settle(game);
    expect(zone(game, reaver)).toBe("battlefield");
    expect(controller(game, reaver)).toBe(C);
  });

  it("a card moved from the graveyard meanwhile is a new object, and stays where it went", () => {
    const { game, a } = table();
    const reaver = spawn(game, "Plague Reaver");
    const discards = [toHand(game, "Wastes"), toHand(game, "Wastes")];
    a.chooseDiscardsFn = () => discards;
    lands(game, "Swamp", 1);
    activate(game, reaver, 0, { targets: [ref(B)] });
    cast(game, toHand(game, "Cremate"), { targets: [ref(reaver)] });
    expect(zone(game, reaver)).toBe("exile");
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, reaver)).toBe("exile");
  });
});
