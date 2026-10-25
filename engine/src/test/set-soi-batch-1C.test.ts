/**
 * Set walk, Shadows over Innistrad, group C. One test per clause most likely
 * to be wrong: Flameblade Angel's punisher (an opponent's source only, to you
 * or your permanent, at the source's controller), To the Slaughter's delirium
 * "a creature and a planeswalker", Liliana's Indignation's count of creature
 * cards milled, Elusive Tormentor // Insidious Mist's round trip, Lamplighter
 * of Selhoff's intervening "if", Morkrut Necropod's "another", Behold the
 * Beyond's whole-hand discard and three-card search, Deathcap Cultivator's
 * delirium and Rattlechains' "target Spirit".
 */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Flameblade Angel", () => {
  it("lets you deal 1 damage to the controller of an opponent's source that damaged you", () => {
    const { game, a } = table();
    spawn(game, "Flameblade Angel");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source: bears });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(19);
  });

  it("triggers on damage to a permanent you control", () => {
    const { game, a } = table();
    spawn(game, "Flameblade Angel");
    const mine = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(mine)], { source: bears });
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("is optional, and ignores a source you control", () => {
    const { game, a } = table();
    spawn(game, "Flameblade Angel");
    const own = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source: bears });
    settle(game);
    expect(life(game, B)).toBe(20);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(A)], { source: own });
    settle(game);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(20);
  });
});

describe("To the Slaughter", () => {
  const board = (delirium: boolean) => {
    const t = table();
    const { game } = t;
    if (delirium) {
      toGraveyard(game, "Forest");
      toGraveyard(game, "Grizzly Bears");
      toGraveyard(game, "Shock");
      toGraveyard(game, "Divination");
    }
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 3;
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "To the Slaughter"), { targets: [ref(B)] });
    const gone = [bears, elves, jace].filter((id) => zone(game, id) === "graveyard");
    return { gone, jace };
  };

  it("has the player sacrifice one creature or planeswalker", () => {
    expect(board(false).gone).toHaveLength(1);
  });

  it("with delirium, a creature and a planeswalker", () => {
    const { gone, jace } = board(true);
    expect(gone).toHaveLength(2);
    expect(gone).toContain(jace);
  });
});

describe("Liliana's Indignation", () => {
  it("drains 2 for each creature card milled", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    toLibrary(game, "Llanowar Elves");
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Liliana's Indignation"), { targets: [ref(B)], x: 3 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Elusive Tormentor // Insidious Mist", () => {
  it("transforms for {1} and a discard, and back when it attacks unblocked and you pay {2}{B}", () => {
    const { game, a } = table();
    const tormentor = spawn(game, "Elusive Tormentor");
    lands(game, "Wastes", 1);
    lands(game, "Swamp", 3);
    toHand(game, "Forest");
    activate(game, tormentor);
    expect(printedCardName(game.state.objects[tormentor])).toBe("Insidious Mist");
    expect(keywords(game, tormentor).has("hexproof")).toBe(true);
    pickModes(a, 0);
    attack(game, a, [tormentor]);
    expect(printedCardName(game.state.objects[tormentor])).toBe("Elusive Tormentor");
    expect(life(game, B)).toBe(16);
  });
});

describe("Lamplighter of Selhoff", () => {
  it("loots only with another Zombie", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Lamplighter of Selhoff");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(0);
    spawn(game, "Crow of Dark Tidings");
    enter(game, "Lamplighter of Selhoff");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Morkrut Necropod", () => {
  it("sacrifices another creature or land as it attacks", () => {
    const { game, a } = table();
    const necropod = spawn(game, "Morkrut Necropod");
    const forest = spawn(game, "Forest");
    attack(game, a, [necropod]);
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, necropod)).toBe("battlefield");
    expect(life(game, B)).toBe(13);
  });
});

describe("Behold the Beyond", () => {
  it("discards the whole hand, then finds three cards", () => {
    const { game } = table();
    toHand(game, "Forest");
    toHand(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 5);
    const discarded = hand(game).length;
    cast(game, toHand(game, "Behold the Beyond"));
    expect(hand(game)).toHaveLength(3);
    expect(graveyard(game)).toHaveLength(discarded + 1);
  });
});

describe("Deathcap Cultivator", () => {
  it("has deathtouch with delirium", () => {
    const { game } = table();
    const cultivator = spawn(game, "Deathcap Cultivator");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock");
    expect(keywords(game, cultivator).has("deathtouch")).toBe(false);
    toGraveyard(game, "Divination");
    expect(keywords(game, cultivator).has("deathtouch")).toBe(true);
  });
});

describe("Rattlechains", () => {
  it("gives any Spirit hexproof, an opponent's included", () => {
    const { game, a } = table();
    const shepherd = spawn(game, "Spectral Shepherd", B);
    pickTargets(a, shepherd);
    enter(game, "Rattlechains");
    expect(keywords(game, shepherd).has("hexproof")).toBe(true);
  });
});
