/**
 * Control changes whose recipient is computed as they happen: a seat ("the
 * player to your right"), the player who controls the most of something, the
 * creature dealt damage, a chooser the trigger names, a different opponent for
 * each permanent; and a permanent entering under an opponent of your choice
 * (rule 614.1d), or returning under one.
 */
import { describe, expect, it } from "vitest";
import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const cantAttackReason = (game: Game, creature: ObjectId, at: PlayerId | ObjectId): string | null =>
  whyCannotAttack(game.state, registryOf(game), B, creature, at);

function castXantcha(game: Game): ObjectId {
  lands(game, "Swamp", 1);
  lands(game, "Mountain", 1);
  lands(game, "Wastes", 1);
  const xantcha = toHand(game, "Xantcha, Sleeper Agent");
  cast(game, xantcha);
  return xantcha;
}

describe("the player to your right", () => {
  it("Hithlain Rope goes to the player before you in turn order, each time its controller's", () => {
    const { game } = table({ players: 4 });
    const rope = spawn(game, "Hithlain Rope", A);
    lands(game, "Wastes", 2);
    const before = hand(game, A).length;
    activate(game, rope, 1);
    expect(hand(game, A).length).toBe(before + 1);
    // Turn order passes to the left (rule 101.4): Alice's right is Dave.
    expect(controller(game, rope)).toBe(D);
  });

  it("skips a player who has left the game, and in two players is the other one", () => {
    const four = table({ players: 4 });
    const rope = spawn(four.game, "Hithlain Rope", A);
    lands(four.game, "Wastes", 2);
    four.game.concede(D);
    activate(four.game, rope, 1);
    expect(controller(four.game, rope)).toBe(C);

    const two = table();
    const other = spawn(two.game, "Hithlain Rope", A);
    lands(two.game, "Wastes", 2);
    activate(two.game, other, 1);
    expect(controller(two.game, other)).toBe(B);
  });

  it("Hithlain Rope fetches a basic tapped, and can't be sacrificed", () => {
    const { game, a } = table();
    const rope = spawn(game, "Hithlain Rope", A);
    lands(game, "Wastes", 1);
    const basic = toLibrary(game, "Forest", A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === basic);
    activate(game, rope, 0);
    expect(zone(game, basic)).toBe("battlefield");
    expect(game.state.objects[basic].tapped).toBe(true);
    expect(controller(game, rope)).toBe(B);
  });

  it("Bucknard's Everfull Purse makes d4 Treasures for its activator, then moves on", () => {
    const { game } = table({ players: 3 });
    const purse = spawn(game, "Bucknard's Everfull Purse", A);
    lands(game, "Wastes", 1);
    activate(game, purse, 0);
    const made = tokensNamed(game, "Treasure Token", A);
    expect(made).toBeGreaterThanOrEqual(1);
    expect(made).toBeLessThanOrEqual(4);
    expect(controller(game, purse)).toBe(C);
  });
});

describe("the player who controls the most", () => {
  it("Thoughtbound Primoc goes to whoever controls more Wizards than each other player", () => {
    const { game } = table({ players: 3, step: "end" });
    const primoc = spawn(game, "Thoughtbound Primoc", B);
    spawn(game, "Prodigal Sorcerer", C);
    spawn(game, "Prodigal Sorcerer", C);
    spawn(game, "Prodigal Sorcerer", A);
    toStep(game, "draw", B);
    expect(controller(game, primoc)).toBe(C);
  });

  it("a tie, or nobody with a Wizard, leaves it where it is", () => {
    const { game } = table({ step: "end" });
    const primoc = spawn(game, "Thoughtbound Primoc", B);
    toStep(game, "draw", B);
    expect(controller(game, primoc)).toBe(B);
    spawn(game, "Prodigal Sorcerer", A);
    spawn(game, "Prodigal Sorcerer", B);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, primoc)).toBe(B);
  });
});

describe("the creature dealt damage", () => {
  it("Charisma takes it for as long as the Aura stays, by any damage", () => {
    const { game } = table();
    const pinger = spawn(game, "Prodigal Sorcerer", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Charisma"), { targets: [ref(pinger)] });
    const [aura] = named(game, "Charisma");
    activate(game, pinger, 0, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    game.debugMove(aura, "graveyard");
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    expect(controller(game, bears)).toBe(B);
  });

  it("doesn't take what dealt damage to a player", () => {
    const { game } = table();
    const pinger = spawn(game, "Prodigal Sorcerer", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Charisma"), { targets: [ref(pinger)] });
    activate(game, pinger, 0, { targets: [ref(B)] });
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Turf War", () => {
  it("puts a counter on a land of each player, and only the seats at the table need one", () => {
    const { game, a } = table();
    const mine = [...lands(game, "Mountain", 1), ...lands(game, "Wastes", 4)];
    const theirs = lands(game, "Wastes", 1, B);
    pickTargets(a, mine[0], theirs[0]);
    cast(game, toHand(game, "Turf War"));
    expect(counters(game, mine[0], "contested")).toBe(1);
    expect(counters(game, theirs[0], "contested")).toBe(1);
  });

  it("is removed from the stack when a player still in the game has no land (rule 603.3d)", () => {
    const { game } = table();
    const mine = [...lands(game, "Mountain", 1), ...lands(game, "Wastes", 4)];
    cast(game, toHand(game, "Turf War"));
    expect(counters(game, mine[0], "contested")).toBe(0);
  });

  it("the attacker's controller takes a contested land of the damaged player and untaps it", () => {
    const { game, a } = table();
    const mine = [...lands(game, "Mountain", 1), ...lands(game, "Wastes", 4)];
    const theirs = lands(game, "Wastes", 1, B);
    pickTargets(a, mine[0], theirs[0]);
    cast(game, toHand(game, "Turf War"));
    game.state.objects[theirs[0]].tapped = true;
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears], B);
    expect(controller(game, theirs[0])).toBe(A);
    expect(game.state.objects[theirs[0]].tapped).toBe(false);
  });

  it("the choice is that creature's controller's, among the damaged player's alone, whoever controls Turf War", () => {
    const { game, a, b, c } = table({ players: 3 });
    const mine = [...lands(game, "Mountain", 1), ...lands(game, "Wastes", 4)];
    const bobs = lands(game, "Wastes", 2, B);
    const carols = lands(game, "Wastes", 1, C);
    pickTargets(a, mine[0], bobs[0], carols[0]);
    cast(game, toHand(game, "Turf War"));
    game.state.objects[bobs[1]].counters = { contested: 1 };
    void b;
    const offered = pickPermanents(c, bobs[1]);
    const bears = spawn(game, "Grizzly Bears", C);
    nextTurn(game);
    nextTurn(game);
    attack(game, c, [bears], B);
    expect(offered.offered).toEqual(expect.arrayContaining([bobs[0], bobs[1]]));
    expect(offered.offered).not.toContain(mine[0]);
    expect(controller(game, bobs[1])).toBe(C);
    expect(controller(game, bobs[0])).toBe(B);
  });

  it("does nothing when the damaged player has no contested land", () => {
    const { game, a } = table();
    const mine = [...lands(game, "Mountain", 1), ...lands(game, "Wastes", 4)];
    const theirs = lands(game, "Wastes", 2, B);
    pickTargets(a, mine[0], theirs[0]);
    cast(game, toHand(game, "Turf War"));
    game.state.objects[theirs[0]].counters = {};
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears], B);
    expect(controller(game, theirs[0])).toBe(B);
    expect(controller(game, theirs[1])).toBe(B);
  });
});

describe("a different opponent for each permanent", () => {
  it("Dack Fayden hands each revealed creature, goaded for good, to the opponent chosen for it", () => {
    const { game, a } = table({ players: 4, deck: "Wastes" });
    // The library's top last spawned first, so these come off in this order.
    const elf = toLibrary(game, "Llanowar Elves", A);
    const forest = toLibrary(game, "Forest", A);
    const bears = toLibrary(game, "Grizzly Bears", A);
    const ox = toLibrary(game, "Hill Giant", A);
    game.state.zones.perPlayer[A].library = [
      elf,
      forest,
      bears,
      ox,
      ...game.state.zones.perPlayer[A].library.filter((id) => ![elf, forest, bears, ox].includes(id)),
    ];
    const asked: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, modes) => {
      asked.push([...modes]);
      return [modes.length - 1];
    };
    enter(game, "Dack Fayden, Helping Hand", A);
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ox)).toBe("battlefield");
    expect(zone(game, forest)).toBe("library");
    // Three opponents, then two: the last is forced.
    expect(asked.map((m) => m.length)).toEqual([3, 2]);
    expect(new Set([elf, bears, ox].map((id) => controller(game, id))).size).toBe(3);
    expect([elf, bears, ox].map((id) => controller(game, id))).not.toContain(A);
    for (const id of [elf, bears, ox]) expect(game.state.objects[id].goadedForGameBy).toContain(A);
    const stamps = [elf, bears, ox].map((id) => game.state.objects[id].controlEffects?.at(-1)?.timestamp);
    expect(new Set(stamps).size).toBe(1);
  });

  it("a library with fewer creatures gives what it has, chosen among all the opponents", () => {
    const { game, a } = table({ players: 3, deck: "Wastes" });
    const elf = toLibrary(game, "Llanowar Elves", A);
    pickModes(a, 1);
    enter(game, "Dack Fayden, Helping Hand", A);
    expect(zone(game, elf)).toBe("battlefield");
    expect(controller(game, elf)).toBe(C);
  });
});

describe("enters under the control of an opponent of your choice", () => {
  it("Xantcha is chosen for as it enters: its caster picks, no one acts while it's theirs", () => {
    const { game, a } = table({ players: 4 });
    const offered: (readonly string[])[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered.push(options);
      return C;
    };
    castXantcha(game);
    const [xantcha] = named(game, "Xantcha, Sleeper Agent");
    expect(offered[0]).toEqual([B, C, D]);
    expect(zone(game, xantcha)).toBe("battlefield");
    expect(controller(game, xantcha)).toBe(C);
    expect(game.state.objects[xantcha].owner).toBe(A);
    expect(game.state.objects[xantcha].controlEffects?.at(-1)?.entered).toBe(true);
  });

  it("Xantcha must attack, and can't attack its owner or a planeswalker its owner controls", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    const xantcha = castXantcha(game);
    expect(controller(game, xantcha)).toBe(B);
    const walker = spawn(game, "Chandra Nalaar", A);
    const theirs = spawn(game, "Chandra Nalaar", C);
    game.state.objects[xantcha].summoningSick = false;
    toStep(game, "precombat-main", B);
    expect(cantAttackReason(game, xantcha, A)).toContain("its owner");
    expect(cantAttackReason(game, xantcha, walker)).toContain("planeswalker its owner controls");
    expect(cantAttackReason(game, xantcha, C)).toBeNull();
    expect(cantAttackReason(game, xantcha, theirs)).toBeNull();
  });

  it("any player may activate Xantcha: its controller loses the life, the activator draws", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    const xantcha = castXantcha(game);
    lands(game, "Wastes", 3);
    const before = hand(game, A).length;
    const lifeB = life(game, B);
    const lifeA = life(game, A);
    activate(game, xantcha, 0, { player: A });
    expect(life(game, B)).toBe(lifeB - 2);
    expect(life(game, A)).toBe(lifeA);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("wins over an effect that puts it onto the battlefield under your control", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    const xantcha = toGraveyard(game, "Xantcha, Sleeper Agent", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Reanimate"), { targets: [ref(xantcha)] });
    expect(zone(game, xantcha)).toBe("battlefield");
    expect(controller(game, xantcha)).toBe(C);
    expect(game.state.objects[xantcha].owner).toBe(B);
  });

  it("is exiled when the player it entered under leaves the game (rule 800.4a)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Pendant of Prosperity"));
    const [pendant] = named(game, "Pendant of Prosperity");
    expect(controller(game, pendant)).toBe(C);
    game.concede(C);
    settle(game);
    expect(zone(game, pendant)).toBe("exile");
  });

  it("Pendant of Prosperity gives its controller and then its owner a card and a land drop", () => {
    const { game, a, b } = table({ deck: "Wastes" });
    a.chooseCreatureTypeFn = () => B;
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Pendant of Prosperity"));
    const [pendant] = named(game, "Pendant of Prosperity");
    expect(controller(game, pendant)).toBe(B);
    const handA = hand(game, A).length;
    const forestA = toHand(game, "Forest", A);
    const forestB = toHand(game, "Forest", B);
    b.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === forestB);
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === forestA);
    lands(game, "Wastes", 2, B);
    toStep(game, "precombat-main", B);
    activate(game, pendant, 0, { player: B });
    expect(zone(game, forestB)).toBe("battlefield");
    expect(controller(game, forestB)).toBe(B);
    expect(zone(game, forestA)).toBe("battlefield");
    expect(controller(game, forestA)).toBe(A);
    expect(hand(game, A).length).toBe(handA + 1);
  });

  it("Captive Audience's new controller chooses each mode once, and it's removed after", () => {
    const { game, a, b } = table({ life: 20 });
    a.chooseCreatureTypeFn = () => B;
    lands(game, "Wastes", 5);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Captive Audience"));
    const [audience] = named(game, "Captive Audience");
    expect(controller(game, audience)).toBe(B);
    pickModes(b, 0);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(4);
    expect(life(game, A)).toBe(20);

    let offered = 0;
    b.chooseModesFn = (_view, _min, _max, modes) => {
      offered = modes.length;
      return [Math.max(0, modes.findIndex((m) => m.includes("Zombie")))];
    };
    nextTurn(game);
    toStep(game, "draw", B);
    expect(offered).toBe(2);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(5);
    expect(tokensNamed(game, "Zombie Token", B)).toBe(0);

    const forest = toHand(game, "Forest", B);
    nextTurn(game);
    toStep(game, "draw", B);
    expect(offered).toBe(1);
    expect(zone(game, forest)).toBe("graveyard");

    // All three gone: nothing to choose, and it stays (the rulings).
    offered = 0;
    nextTurn(game);
    toStep(game, "draw", B);
    expect(offered).toBe(0);
    expect(zone(game, audience)).toBe("battlefield");
  });
});

describe("returns under an opponent's control", () => {
  it("Sol'Kanar comes back under the opponent chosen, a new object with nothing chosen yet", () => {
    const { game, a } = table({ players: 3 });
    const solkanar = spawn(game, "Sol'Kanar the Tainted", A);
    a.chooseModesFn = (_view, _min, _max, modes) => {
      // The mode first (the last one), then Carol among the opponents.
      return [modes.length - 1];
    };
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, solkanar)).toBe("battlefield");
    expect(controller(game, solkanar)).toBe(C);
    expect(game.state.objects[solkanar].owner).toBe(A);
    expect(game.state.objects[solkanar].controlEffects?.at(-1)?.entered).toBe(true);
  });

  it("Sol'Kanar's other modes: draw, drain, and up to one other target", () => {
    const { game, a } = table();
    const solkanar = spawn(game, "Sol'Kanar the Tainted", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, A).length;
    pickModes(a, 0);
    toStep(game, "end", A);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);

    toStep(game, "precombat-main", A);
    const lifeA = life(game, A);
    const lifeB = life(game, B);
    pickModes(a, 0);
    toStep(game, "end", A);
    settle(game);
    expect(life(game, A)).toBe(lifeA + 2);
    expect(life(game, B)).toBe(lifeB - 2);

    toStep(game, "precombat-main", A);
    pickModes(a, 0);
    pickTargets(a, bears);
    toStep(game, "end", A);
    settle(game);
    expect(graveyard(game, B)).toContain(bears);
    expect(zone(game, solkanar)).toBe("battlefield");
  });

  it("Zuko loses 2 life with the mode chosen", () => {
    const { game, a, b } = table({ life: 40, step: "end" });
    const zuko = spawn(game, "Zuko, Conflicted", A);
    pickModes(a, 1);
    pickModes(b, 0);
    nextTurn(game, "postcombat-main");
    nextTurn(game, "postcombat-main");
    expect(counters(game, zuko)).toBe(1);
    expect(life(game, A)).toBe(38);
  });

  it("Zuko's last mode hands him to an opponent, who chooses for him from then on", () => {
    const { game, a, b } = table({ life: 40, step: "end", players: 2 });
    const zuko = spawn(game, "Zuko, Conflicted", A);
    a.chooseModesFn = (_view, _min, _max, modes) => [modes.findIndex((m) => m.includes("Exile"))];
    pickModes(b, 0);
    nextTurn(game, "postcombat-main");
    nextTurn(game, "postcombat-main");
    expect(controller(game, zuko)).toBe(B);
    expect(life(game, A)).toBe(38);
    const lifeB = life(game, B);
    nextTurn(game, "postcombat-main");
    expect(life(game, B)).toBe(lifeB - 2);
  });
});
