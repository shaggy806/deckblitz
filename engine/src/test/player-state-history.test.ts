/**
 * Conditions on what has happened to a player and on counts of distinct things:
 * `turn-history`'s `combat-damaged-by` (each source as it dealt the damage),
 * `attacked-you-last-turn`, the `distinct` aggregates of card types and counter
 * kinds, an aggregate's `countsSelf` and `"prime"`, `cards-in-graveyard`'s
 * `excludeSelf`, and `controls`' `sharingAName` and `distinctNames`.
 */
import { describe, expect, it } from "vitest";
import { staticConditionMet } from "../characteristics.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, attack, cast, counters, destroy, graveyard, hand, keywords, lands, life, named, nextTurn, pickFromZone, pickTargets, pt, ref, settle, spawn, subtypes, table, toGraveyard, toHand, toLibrary, toStep, tokensNamed, zone } from "./harness.js";
import type { Table } from "./harness.js";

const ready = (t: Table, name: string, player: PlayerId = A): ObjectId => spawn(t.game, name, player, { sick: false });
const library = (t: Table, player: PlayerId = A): number => t.game.state.zones.perPlayer[player].library.length;

describe("dealt combat damage by a filter this turn", () => {
  it("Lost Monarch of Ifnir: a Zombie's damage, then mill three and a creature back", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Lost Monarch of Ifnir");
    const zombie = ready(t, "Walking Corpse");
    const back = toGraveyard(t.game, "Grizzly Bears");
    const before = library(t);
    pickFromZone(t.a, back);
    attack(t.game, t.a, [zombie], B);
    settle(t.game);
    expect(library(t)).toBe(before - 3);
    expect(zone(t.game, back)).toBe("hand");
  });

  it("Lost Monarch: nothing for a non-Zombie's damage", () => {
    const t = table();
    spawn(t.game, "Lost Monarch of Ifnir");
    const bears = ready(t, "Grizzly Bears");
    const before = library(t);
    attack(t.game, t.a, [bears], B);
    settle(t.game);
    expect(library(t)).toBe(before);
  });

  it("Lost Monarch: a Zombie that hit and has died since still dealt it, as it was", () => {
    const t = table();
    spawn(t.game, "Lost Monarch of Ifnir");
    const zombie = ready(t, "Walking Corpse");
    const before = library(t);
    t.a.declareAttackersFn = () => [{ attacker: zombie, defender: B }];
    t.game.advanceUntil((s) => s.turn.step === "combat-damage" && s.priority.holder === A);
    expect(life(t.game, B)).toBe(18);
    destroy(t.game, zombie);
    expect(zone(t.game, zombie)).toBe("graveyard");
    toStep(t.game, "postcombat-main");
    settle(t.game);
    expect(library(t)).toBe(before - 3);
  });

  it("Lost Monarch: a creature that becomes a Zombie after it hit didn't deal it as one", () => {
    const t = table();
    spawn(t.game, "Lost Monarch of Ifnir");
    const bears = ready(t, "Grizzly Bears");
    const before = library(t);
    t.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    t.game.advanceUntil((s) => s.turn.step === "combat-damage" && s.priority.holder === A);
    t.game.debugApplyEffect(A, { kind: "add-types", target: 0, addSubtypes: ["Zombie"], duration: "end-of-turn" }, [ref(bears)]);
    expect(subtypes(t.game, bears)).toContain("Zombie");
    toStep(t.game, "postcombat-main");
    settle(t.game);
    expect(library(t)).toBe(before);
  });

  it("Other Zombies have afflict 3", () => {
    const t = table();
    spawn(t.game, "Lost Monarch of Ifnir");
    const zombie = ready(t, "Walking Corpse");
    const blocker = spawn(t.game, "Grizzly Bears", B);
    t.a.declareAttackersFn = () => [{ attacker: zombie, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker, attacker: zombie }];
    const before = life(t.game, B);
    toStep(t.game, "postcombat-main");
    expect(life(t.game, B)).toBe(before - 3);
  });

  it("Blitzball: after an opponent took combat damage from a legendary creature, anyone's (the ruling)", () => {
    const t = table({ players: 3 });
    const ball = spawn(t.game, "Blitzball");
    expect(() => activate(t.game, ball, 1)).toThrow();
    // Bob's legend hits Carol on Bob's turn: Carol is one of Alice's opponents.
    const legend = ready(t, "Isamaru, Hound of Konda", B);
    nextTurn(t.game);
    t.b.declareAttackersFn = () => [{ attacker: legend, defender: C }];
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(life(t.game, C)).toBe(18);
    const before = hand(t.game).length;
    activate(t.game, ball, 1);
    expect(hand(t.game).length).toBe(before + 2);
    expect(zone(t.game, ball)).toBe("graveyard");
  });

  it("Blitzball: not a nonlegendary creature's damage", () => {
    const t = table();
    const ball = spawn(t.game, "Blitzball");
    const bears = ready(t, "Grizzly Bears");
    attack(t.game, t.a, [bears], B);
    expect(() => activate(t.game, ball, 1)).toThrow();
  });

  it("Blitzball: not the damage you were dealt yourself", () => {
    const t = table();
    const ball = spawn(t.game, "Blitzball");
    const legend = ready(t, "Isamaru, Hound of Konda", B);
    nextTurn(t.game);
    t.b.declareAttackersFn = () => [{ attacker: legend, defender: A }];
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(life(t.game, A)).toBe(18);
    expect(() => activate(t.game, ball, 1)).toThrow();
  });

  it("the list clears with the turn", () => {
    const t = table();
    const ball = spawn(t.game, "Blitzball");
    const legend = ready(t, "Isamaru, Hound of Konda");
    attack(t.game, t.a, [legend], B);
    nextTurn(t.game);
    t.game.advanceUntil((s) => s.turn.number > 1 && s.priority.holder === A);
    expect(() => activate(t.game, ball, 1)).toThrow();
  });

  it("Wave of Rats: comes back if it dealt combat damage this turn, in this stint", () => {
    const t = table();
    const rats = ready(t, "Wave of Rats");
    attack(t.game, t.a, [rats], B);
    destroy(t.game, rats);
    expect(zone(t.game, rats)).toBe("battlefield");
    // It's a new object now (rule 400.7), and this one hasn't dealt any.
    destroy(t.game, rats);
    expect(zone(t.game, rats)).toBe("graveyard");
  });

  it("Wave of Rats: stays dead if it hasn't", () => {
    const t = table();
    const rats = ready(t, "Wave of Rats");
    destroy(t.game, rats);
    expect(zone(t.game, rats)).toBe("graveyard");
  });

  it("Wave of Rats: blitz {4}{B}: haste, sacrificed at the next end step with a card drawn, and dead if it dealt no combat damage", () => {
    const t = table();
    lands(t.game, "Swamp", 5);
    const rats = toHand(t.game, "Wave of Rats");
    cast(t.game, rats, { via: "blitz" } as never);
    expect(keywords(t.game, rats).has("haste")).toBe(true);
    const before = hand(t.game).length;
    toStep(t.game, "end");
    settle(t.game);
    expect(zone(t.game, rats)).toBe("graveyard");
    expect(hand(t.game).length).toBe(before + 1);
  });

  it("Wave of Rats: blitz needs its whole cost", () => {
    const t = table();
    lands(t.game, "Swamp", 4);
    expect(() => cast(t.game, toHand(t.game, "Wave of Rats"), { via: "blitz" } as never)).toThrow();
  });

  it("Wave of Rats: blitzed, it hits, then its sacrifice draws and returns it, a new object with no haste or second sacrifice", () => {
    const t = table();
    lands(t.game, "Swamp", 5);
    const rats = toHand(t.game, "Wave of Rats");
    cast(t.game, rats, { via: "blitz" } as never);
    attack(t.game, t.a, [rats], B);
    expect(life(t.game, B)).toBe(16);
    const before = hand(t.game).length;
    toStep(t.game, "end");
    settle(t.game);
    expect(zone(t.game, rats)).toBe("battlefield");
    expect(hand(t.game).length).toBe(before + 1);
    expect(keywords(t.game, rats).has("haste")).toBe(false);
    nextTurn(t.game);
    expect(zone(t.game, rats)).toBe("battlefield");
  });

  it("Wave of Rats: trample's excess over a blocker that kills it is combat damage to a player, so it returns", () => {
    const t = table();
    const rats = ready(t, "Wave of Rats");
    const blocker = spawn(t.game, "Grizzly Bears", B);
    t.a.declareAttackersFn = () => [{ attacker: rats, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker, attacker: rats }];
    toStep(t.game, "postcombat-main");
    expect(zone(t.game, blocker)).toBe("graveyard");
    expect(life(t.game, B)).toBe(18);
    expect(zone(t.game, rats)).toBe("battlefield");
  });

  it("Wave of Rats: killed by a blocker it can't trample over, it dealt a player nothing and stays dead", () => {
    const t = table();
    const rats = ready(t, "Wave of Rats");
    const blocker = spawn(t.game, "Serra Angel", B);
    t.a.declareAttackersFn = () => [{ attacker: rats, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker, attacker: rats }];
    toStep(t.game, "postcombat-main");
    expect(life(t.game, B)).toBe(20);
    expect(zone(t.game, rats)).toBe("graveyard");
  });

  it("Estinien Varlineau: each opponent once, by him or a Dragon", () => {
    const t = table({ players: 4 });
    const estinien = ready(t, "Estinien Varlineau");
    const dragon = ready(t, "Shivan Dragon");
    const other = ready(t, "Shivan Dragon");
    const bears = ready(t, "Grizzly Bears");
    const beforeHand = hand(t.game).length;
    const beforeLife = life(t.game);
    t.a.declareAttackersFn = () => [
      { attacker: estinien, defender: B },
      { attacker: dragon, defender: B },
      { attacker: other, defender: C },
      { attacker: bears, defender: "dave" as PlayerId },
    ];
    toStep(t.game, "postcombat-main");
    settle(t.game);
    expect(hand(t.game).length).toBe(beforeHand + 2);
    expect(life(t.game)).toBe(beforeLife - 2);
  });
});

describe("attacked you during their last turn", () => {
  it("Avenge costs {2} less after a player attacked you, not otherwise", () => {
    const t = table();
    const avenge = toHand(t.game, "Avenge");
    lands(t.game, "Plains", 4);
    expect(() => cast(t.game, avenge)).toThrow();
    const attacker = ready(t, "Grizzly Bears", B);
    nextTurn(t.game);
    t.b.declareAttackersFn = () => [{ attacker, defender: A }];
    toStep(t.game, "precombat-main", A);
    const bears = spawn(t.game, "Grizzly Bears", B);
    const gained = life(t.game);
    cast(t.game, avenge);
    expect(zone(t.game, bears)).toBe("graveyard");
    expect(zone(t.game, attacker)).toBe("graveyard");
    expect(life(t.game)).toBe(gained + 2);
  });

  it("O-Kagachi exiles from the player who attacked you last turn, not another", () => {
    const t = table({ players: 3 });
    const kami = ready(t, "O-Kagachi, Vengeful Kami");
    const attacker = ready(t, "Grizzly Bears", B);
    const relic = spawn(t.game, "Sol Ring", B);
    const carols = spawn(t.game, "Sol Ring", C);
    // Bob attacks Alice on his turn; Alice then hits Carol and Bob in turn.
    nextTurn(t.game);
    t.b.declareAttackersFn = () => [{ attacker, defender: A }];
    toStep(t.game, "precombat-main", A);
    pickTargets(t.a, relic);
    attack(t.game, t.a, [kami], B);
    expect(zone(t.game, relic)).toBe("exile");
    expect(zone(t.game, carols)).toBe("battlefield");
  });

  it("O-Kagachi: nothing from a player who didn't attack you", () => {
    const t = table({ players: 3 });
    const kami = ready(t, "O-Kagachi, Vengeful Kami");
    const carols = spawn(t.game, "Sol Ring", C);
    pickTargets(t.a, carols);
    attack(t.game, t.a, [kami], C);
    expect(zone(t.game, carols)).toBe("battlefield");
  });
});

describe("distinct card types and counter kinds", () => {
  const fill = (t: Table, ...names: readonly string[]): void => {
    for (const name of names) toGraveyard(t.game, name);
  };
  const flytrap = (t: Table, one: ObjectId, two?: ObjectId): void => {
    lands(t.game, "Forest", 3);
    pickTargets(t.a, ...(two === undefined ? [one, null] : [one, two]));
    cast(t.game, toHand(t.game, "Omnivorous Flytrap"));
  };

  it("Omnivorous Flytrap at delirium: two counters, no doubling", () => {
    const t = table();
    fill(t, "Sol Ring", "Grizzly Bears", "Lightning Bolt", "Divination");
    const bears = spawn(t.game, "Grizzly Bears");
    flytrap(t, bears);
    expect(counters(t.game, bears)).toBe(2);
  });

  it("Omnivorous Flytrap at six types: the counters doubled, on each target", () => {
    const t = table();
    fill(t, "Sol Ring", "Grizzly Bears", "Lightning Bolt", "Divination", "Forest", "Pacifism");
    const one = spawn(t.game, "Grizzly Bears");
    const two = spawn(t.game, "Grizzly Bears");
    flytrap(t, one, two);
    expect(counters(t.game, one)).toBe(2);
    expect(counters(t.game, two)).toBe(2);
  });

  it("Omnivorous Flytrap: below delirium, no trigger; another player's graveyard doesn't help", () => {
    const t = table();
    fill(t, "Sol Ring", "Grizzly Bears", "Lightning Bolt");
    toGraveyard(t.game, "Divination", B);
    const bears = spawn(t.game, "Grizzly Bears");
    lands(t.game, "Forest", 3);
    cast(t.game, toHand(t.game, "Omnivorous Flytrap"));
    expect(counters(t.game, bears)).toBe(0);
  });

  it("Hundred-Battle Veteran: three kinds among your creatures, its own counters included", () => {
    const t = table();
    const vet = spawn(t.game, "Hundred-Battle Veteran");
    const bears = spawn(t.game, "Grizzly Bears");
    t.game.state.objects[vet].counters = { "+1/+1": 3 };
    t.game.state.objects[bears].counters = { "+1/+1": 1, shield: 1 };
    expect(pt(t.game, vet).power).toBe(7);
    t.game.state.objects[vet].counters = { finality: 1 };
    expect(pt(t.game, vet)).toEqual({ power: 6, toughness: 6 });
    t.game.state.objects[vet].counters = {};
    expect(pt(t.game, vet)).toEqual({ power: 4, toughness: 2 });
  });

  it("Hundred-Battle Veteran: another player's counters aren't yours", () => {
    const t = table();
    const vet = spawn(t.game, "Hundred-Battle Veteran");
    t.game.state.objects[vet].counters = { "+1/+1": 1 };
    const theirs = spawn(t.game, "Grizzly Bears", B);
    t.game.state.objects[theirs].counters = { shield: 1, stun: 1 };
    expect(pt(t.game, vet)).toEqual({ power: 5, toughness: 3 });
  });

  it("Hundred-Battle Veteran: from your graveyard, with a finality counter", () => {
    const t = table();
    const vet = toGraveyard(t.game, "Hundred-Battle Veteran");
    lands(t.game, "Swamp", 4);
    cast(t.game, vet, { via: "graveyard-permission" } as never);
    expect(zone(t.game, vet)).toBe("battlefield");
    expect(counters(t.game, vet, "finality")).toBe(1);
  });

  it("Hundred-Battle Veteran: from your hand, no finality counter", () => {
    const t = table();
    const vet = toHand(t.game, "Hundred-Battle Veteran");
    lands(t.game, "Swamp", 4);
    cast(t.game, vet);
    expect(counters(t.game, vet, "finality")).toBe(0);
  });
});

describe("the graveyard counts", () => {
  it("Avatar of Woe costs {6} less with ten creature cards across all graveyards", () => {
    const t = table({ players: 3 });
    const avatar = toHand(t.game, "Avatar of Woe");
    lands(t.game, "Swamp", 2);
    for (let i = 0; i < 9; i += 1) toGraveyard(t.game, "Grizzly Bears", i % 2 === 0 ? B : C);
    expect(() => cast(t.game, avatar)).toThrow();
    toGraveyard(t.game, "Divination", A);
    expect(() => cast(t.game, avatar)).toThrow();
    toGraveyard(t.game, "Grizzly Bears", A);
    cast(t.game, avatar);
    expect(zone(t.game, avatar)).toBe("battlefield");
  });

  it("Proft needs seven cards in your graveyard from hand", () => {
    const t = table();
    const proft = toHand(t.game, "Proft, Sinister Mastermind");
    lands(t.game, "Swamp", 3);
    for (let i = 0; i < 6; i += 1) toGraveyard(t.game, "Grizzly Bears");
    expect(() => cast(t.game, proft)).toThrow();
    toGraveyard(t.game, "Grizzly Bears");
    cast(t.game, proft);
    expect(zone(t.game, proft)).toBe("battlefield");
  });

  it("Proft in your graveyard doesn't count itself (the ruling)", () => {
    const t = table();
    const proft = toGraveyard(t.game, "Proft, Sinister Mastermind");
    for (let i = 0; i < 6; i += 1) toGraveyard(t.game, "Grizzly Bears");
    expect(graveyard(t.game).length).toBe(7);
    const def = t.game.registry.get("Proft, Sinister Mastermind");
    const met = (): boolean =>
      staticConditionMet(t.game.state, t.game.registry, t.game.state.objects[proft], def.castOnlyIf!, { includeSelf: true, outsideFold: true });
    expect(met()).toBe(false);
    toGraveyard(t.game, "Grizzly Bears");
    expect(met()).toBe(true);
  });

  it("Proft's own discard ability from hand", () => {
    const t = table();
    const proft = toHand(t.game, "Proft, Sinister Mastermind");
    const target = spawn(t.game, "Hill Giant", B);
    lands(t.game, "Swamp", 1);
    activate(t.game, proft, 0, { targets: [ref(target)] });
    expect(zone(t.game, proft)).toBe("graveyard");
    expect(pt(t.game, target)).toEqual({ power: 0, toughness: 2 });
  });
});

describe("a prime number of lands (Zimone, All-Questioning)", () => {
  const endStep = (t: Table): void => {
    toStep(t.game, "end");
    settle(t.game);
  };

  it("makes Primo with that many counters on a prime count after a land entered", () => {
    const t = table();
    spawn(t.game, "Zimone, All-Questioning");
    lands(t.game, "Forest", 4);
    const land = toHand(t.game, "Forest");
    t.game.dispatch({ type: "play-land", player: A, card: land });
    endStep(t);
    expect(tokensNamed(t.game, "Primo, the Indivisible Token", A)).toBe(1);
    expect(counters(t.game, named(t.game, "Primo, the Indivisible Token", A)[0])).toBe(5);
  });

  it("not on a composite count", () => {
    const t = table();
    spawn(t.game, "Zimone, All-Questioning");
    lands(t.game, "Forest", 3);
    t.game.dispatch({ type: "play-land", player: A, card: toHand(t.game, "Forest") });
    endStep(t);
    expect(tokensNamed(t.game, "Primo, the Indivisible Token", A)).toBe(0);
  });

  it("not on one land, which isn't prime", () => {
    const t = table();
    spawn(t.game, "Zimone, All-Questioning");
    t.game.dispatch({ type: "play-land", player: A, card: toHand(t.game, "Forest") });
    endStep(t);
    expect(tokensNamed(t.game, "Primo, the Indivisible Token", A)).toBe(0);
  });

  it("not unless a land entered this turn", () => {
    const t = table();
    spawn(t.game, "Zimone, All-Questioning");
    lands(t.game, "Forest", 5);
    endStep(t);
    expect(tokensNamed(t.game, "Primo, the Indivisible Token", A)).toBe(0);
  });
});

describe("lands with the same name, and different names", () => {
  it("Endless Atlas: three of one name, not three lands", () => {
    const t = table();
    const atlas = spawn(t.game, "Endless Atlas");
    lands(t.game, "Forest", 2);
    lands(t.game, "Plains", 1);
    lands(t.game, "Wastes", 2);
    expect(() => activate(t.game, atlas, 0)).toThrow();
    lands(t.game, "Wastes", 1);
    const before = hand(t.game).length;
    activate(t.game, atlas, 0);
    expect(hand(t.game).length).toBe(before + 1);
  });

  it("Sceptre of Eternal Glory: three mana only with three of one name", () => {
    const t = table();
    const sceptre = spawn(t.game, "Sceptre of Eternal Glory");
    const offers = (): number =>
      t.game.legalActions(A).filter((o) => "source" in o && o.source === sceptre).length;
    lands(t.game, "Forest", 2);
    const without = offers();
    lands(t.game, "Forest", 1);
    expect(offers()).toBeGreaterThan(without);
  });

  it("Chrome Replicator: a second one makes the Construct, the first doesn't", () => {
    const t = table();
    lands(t.game, "Wastes", 10);
    cast(t.game, toHand(t.game, "Chrome Replicator"));
    expect(tokensNamed(t.game, "Construct Token (Retrofitter Foundry)", A)).toBe(0);
    cast(t.game, toHand(t.game, "Chrome Replicator"));
    expect(tokensNamed(t.game, "Construct Token (Retrofitter Foundry)", A)).toBe(1);
  });

  it("Chrome Replicator: any pair of nonland, nontoken permanents, not lands", () => {
    const t = table();
    lands(t.game, "Wastes", 5);
    spawn(t.game, "Grizzly Bears");
    cast(t.game, toHand(t.game, "Chrome Replicator"));
    expect(tokensNamed(t.game, "Construct Token (Retrofitter Foundry)", A)).toBe(0);
    const u = table();
    lands(u.game, "Wastes", 5);
    spawn(u.game, "Grizzly Bears");
    spawn(u.game, "Grizzly Bears");
    cast(u.game, toHand(u.game, "Chrome Replicator"));
    expect(tokensNamed(u.game, "Construct Token (Retrofitter Foundry)", A)).toBe(1);
  });

  it("Maze's End: ten Gates with different names win; a repeat name doesn't count", () => {
    const gates = [
      "Azorius Guildgate", "Boros Guildgate", "Dimir Guildgate", "Golgari Guildgate", "Gruul Guildgate",
      "Izzet Guildgate", "Orzhov Guildgate", "Rakdos Guildgate", "Selesnya Guildgate",
    ];
    const t = table();
    for (const gate of gates) spawn(t.game, gate);
    spawn(t.game, "Azorius Guildgate");
    const maze = spawn(t.game, "Maze's End", A, { tapped: false });
    t.game.state.objects[maze].tapped = false;
    lands(t.game, "Wastes", 3);
    const last = toLibrary(t.game, "Simic Guildgate");
    pickFromZone(t.a, last);
    activate(t.game, maze, 1);
    expect(zone(t.game, maze)).toBe("hand");
    expect(zone(t.game, last)).toBe("battlefield");
    expect(t.game.state.result.winner).toBe(A);
  });

  it("Maze's End: nine different names and a repeat don't", () => {
    const gates = [
      "Azorius Guildgate", "Boros Guildgate", "Dimir Guildgate", "Golgari Guildgate", "Gruul Guildgate",
      "Izzet Guildgate", "Orzhov Guildgate", "Rakdos Guildgate",
    ];
    const t = table();
    for (const gate of gates) spawn(t.game, gate);
    const maze = spawn(t.game, "Maze's End", A, { tapped: false });
    t.game.state.objects[maze].tapped = false;
    lands(t.game, "Wastes", 3);
    const last = toLibrary(t.game, "Rakdos Guildgate");
    pickFromZone(t.a, last);
    activate(t.game, maze, 1);
    expect(zone(t.game, last)).toBe("battlefield");
    expect(t.game.state.result.over).toBe(false);
  });

  // Each Room in with one door unlocked, or both.
  const room = (t: Table, name: string, doors: { left: boolean; right: boolean }): ObjectId => {
    const id = toHand(t.game, name);
    lands(t.game, "Island", 7);
    lands(t.game, "Forest", 7);
    t.game.dispatch({ type: "cast-spell", player: A, card: id, face: doors.left ? 1 : 2, targets: [] } as never);
    settle(t.game);
    if (doors.left && doors.right) t.game.dispatch({ type: "unlock-door", player: A, permanent: id, door: "right" });
    settle(t.game);
    return id;
  };
  const ROOMS = "Moldering Gym // Weight Room";

  it("Promising Stairs: counts names, a Room with two unlocked doors two (the ruling)", () => {
    const t = table();
    const stairs = room(t, "Central Elevator // Promising Stairs", { left: false, right: true });
    expect(t.game.state.objects[stairs].doors).toEqual({ left: false, right: true });
    const names = (): number => {
      const distinct = (atLeast: number): boolean =>
        staticConditionMet(
          t.game.state,
          t.game.registry,
          t.game.state.objects[stairs],
          { kind: "controls", filter: { subtype: "Room" }, atLeast, distinctNames: true },
          { includeSelf: true, outsideFold: true },
        );
      let n = 0;
      while (distinct(n + 1)) n += 1;
      return n;
    };
    expect(names()).toBe(1);
    room(t, "Bottomless Pool // Locker Room", { left: true, right: true });
    expect(names()).toBe(3);
  });

  it("Central Elevator: not a Room sharing a name with a door you've unlocked", () => {
    const t = table();
    room(t, ROOMS, { left: true, right: false });
    const shares = toLibrary(t.game, ROOMS);
    const free = toLibrary(t.game, "Bottomless Pool // Locker Room");
    const seen = pickFromZone(t.a, free);
    room(t, "Central Elevator // Promising Stairs", { left: true, right: false });
    expect(seen.offered).toContain(free);
    expect(seen.offered).not.toContain(shares);
    expect(zone(t.game, free)).toBe("hand");
  });

  // Rule 709.5: a permanent without a half's unlocked designation doesn't have
  // that half's name, so a Room with both doors locked has no name at all. It
  // enters so when neither half was cast (709.5d).
  describe("a Room with both doors locked has no name (rule 709.5)", () => {
    const locked = (t: Table, name = ROOMS, player: PlayerId = A): ObjectId => {
      const id = spawn(t.game, name, player);
      expect(t.game.state.objects[id].doors).toEqual({ left: false, right: false });
      return id;
    };
    const met = (t: Table, id: ObjectId, atLeast: number, how: "distinctNames" | "sharingAName"): boolean =>
      staticConditionMet(
        t.game.state,
        t.game.registry,
        t.game.state.objects[id],
        { kind: "controls", filter: { subtype: "Room" }, atLeast, [how]: true },
        { includeSelf: true, outsideFold: true },
      );

    it("is still a Room, but adds no name to distinctNames", () => {
      const t = table();
      const id = locked(t);
      expect(staticConditionMet(t.game.state, t.game.registry, t.game.state.objects[id], { kind: "controls", filter: { subtype: "Room" }, atLeast: 1 }, { includeSelf: true, outsideFold: true })).toBe(true);
      expect(met(t, id, 1, "distinctNames")).toBe(false);
    });

    it("two of the same card have no name in common", () => {
      const t = table();
      const id = locked(t);
      locked(t);
      expect(met(t, id, 2, "sharingAName")).toBe(false);
      expect(met(t, id, 1, "sharingAName")).toBe(false);
    });

    it("doesn't stop Central Elevator finding that same Room (the ruling)", () => {
      const t = table();
      locked(t);
      const same = toLibrary(t.game, ROOMS);
      const seen = pickFromZone(t.a, same);
      room(t, "Central Elevator // Promising Stairs", { left: true, right: false });
      expect(seen.offered).toContain(same);
      expect(zone(t.game, same)).toBe("hand");
    });

    it("has no different name from anything itself (rule 201.2c)", () => {
      const t = table();
      const id = locked(t);
      expect(matchesFilter(t.game.state, t.game.registry, id, { nameDiffersFromEach: { type: "creature" } }, { you: A })).toBe(false);
      const named = spawn(t.game, "Grizzly Bears");
      expect(matchesFilter(t.game.state, t.game.registry, named, { nameDiffersFromEach: { subtype: "Room" } }, { you: A })).toBe(true);
    });
  });
});
