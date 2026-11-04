import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  hand,
  keywords,
  lands,
  nextTurn,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

// Which defender, how many, and once for the lot: `attacks`' and `attacks-alone`'s
// defender clauses, `attack-with`'s `eachOf` and `attackingYouDirectly`,
// `becomes-blocked`'s `blockers` and `blocks`' `blocking`, and `become-blocked-batch`.

/** Run to the declare attackers step with those attacks made, triggers resolved. */
function attacking(
  t: ReturnType<typeof table>,
  attacks: readonly (readonly [ObjectId, PlayerId | ObjectId])[],
  seat: "a" | "b" = "a",
): void {
  t[seat].declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  t.game.advanceUntil(
    (s) => s.turn.step === "declare-attackers" && s.objects[attacks[0][0]].attackedThisTurn === true && quiet(s),
  );
}

const toBlockers = (game: Game, blocker: ObjectId): void => {
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && (s.objects[blocker].blocking ?? null) !== null && quiet(s));
};

describe("which defender an attack trigger asks for", () => {
  it("Genestealer Locus: -1/-0 on what attacks you, +0/+1 on what attacks an opponent, nothing for a planeswalker", () => {
    const t = table({ players: 3 });
    const { game } = t;
    spawn(game, "Genestealer Locus", B);
    const atBob = spawn(game, "Grizzly Bears");
    const atCarol = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Jace Beleren", C);
    const atWalker = spawn(game, "Grizzly Bears");
    attacking(t, [
      [atBob, B],
      [atCarol, C],
      [atWalker, walker],
    ]);
    expect(pt(game, atBob)).toEqual({ power: 1, toughness: 2 });
    expect(pt(game, atCarol)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, atWalker)).toEqual({ power: 2, toughness: 2 });
  });

  it("Gahiji: +2/+0 attacking an opponent or an opponent's planeswalker, not its controller", () => {
    const t = table({ players: 3 });
    const { game } = t;
    spawn(game, "Gahiji, Honored One", B);
    const atBob = spawn(game, "Grizzly Bears");
    const atCarol = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Jace Beleren", C);
    const atWalker = spawn(game, "Grizzly Bears");
    const hisWalker = spawn(game, "Jace Beleren", B);
    const atHisWalker = spawn(game, "Grizzly Bears");
    attacking(t, [
      [atBob, B],
      [atCarol, C],
      [atWalker, walker],
      [atHisWalker, hisWalker],
    ]);
    expect(pt(game, atBob).power).toBe(2);
    expect(pt(game, atCarol).power).toBe(4);
    expect(pt(game, atWalker).power).toBe(4);
    expect(pt(game, atHisWalker).power).toBe(2);
  });

  it("M'Baku: an opponent becomes the monarch at your end step if nobody is", () => {
    const { game } = table();
    spawn(game, "M'Baku, Jabari Chieftain");
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.turn.number > turn);
    expect(game.state.monarch).toBe(B);
  });

  it("M'Baku: +1/+1 and trample only on what attacks an opponent who is the monarch", () => {
    const t = table({ players: 3 });
    const { game } = t;
    spawn(game, "M'Baku, Jabari Chieftain", A);
    game.state.monarch = C;
    const atBob = spawn(game, "Grizzly Bears");
    const atCarol = spawn(game, "Grizzly Bears");
    attacking(t, [
      [atBob, B],
      [atCarol, C],
    ]);
    expect(pt(game, atBob)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, atCarol)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, atCarol).has("trample")).toBe(true);
  });

  it("M'Baku's intervening if: not if that player has stopped being the monarch by resolution", () => {
    const t = table({ players: 3 });
    const { game } = t;
    spawn(game, "M'Baku, Jabari Chieftain", A);
    game.state.monarch = C;
    const atCarol = spawn(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker: atCarol, defender: C }];
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.turn.step === "declare-attackers");
    game.state.monarch = B;
    game.advanceUntil(quiet);
    expect(pt(game, atCarol)).toEqual({ power: 2, toughness: 2 });
  });

  it("The Spear of Bashenga: makes you the monarch if nobody is; destroys when its creature attacks the monarch", () => {
    const t = table();
    const { game } = t;
    lands(game, "Plains", 5);
    const spear = toHand(game, "The Spear of Bashenga");
    cast(game, spear);
    expect(game.state.monarch).toBe(A);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[spear].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    game.state.monarch = B;
    const relic = spawn(game, "Sol Ring", B, { tapped: true });
    const land = spawn(game, "Forest", B, { tapped: true });
    t.a.chooseTargetsFn = () => [ref(relic)];
    attacking(t, [[bears, B]]);
    expect(zone(game, relic)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });

  it("The Spear of Bashenga: nothing if the player attacked isn't the monarch", () => {
    const t = table({ players: 3 });
    const { game } = t;
    const spear = spawn(game, "The Spear of Bashenga");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[spear].attachedTo = bears;
    game.state.monarch = C;
    const relic = spawn(game, "Sol Ring", B, { tapped: true });
    attacking(t, [[bears, B]]);
    expect(zone(game, relic)).toBe("battlefield");
  });

  it("Yuriko: double strike on a lone attack on a player, not on a planeswalker or beside another", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Yuriko, Blade of the Mighty");
    const lone = spawn(game, "Grizzly Bears");
    attacking(t, [[lone, B]]);
    expect(keywords(game, lone).has("double-strike")).toBe(true);

    const u = table();
    spawn(u.game, "Yuriko, Blade of the Mighty");
    const walker = spawn(u.game, "Jace Beleren", B);
    const atWalker = spawn(u.game, "Grizzly Bears");
    attacking(u, [[atWalker, walker]]);
    expect(keywords(u.game, atWalker).has("double-strike")).toBe(false);

    const v = table();
    spawn(v.game, "Yuriko, Blade of the Mighty");
    const one = spawn(v.game, "Grizzly Bears");
    const two = spawn(v.game, "Grizzly Bears");
    attacking(v, [
      [one, B],
      [two, B],
    ]);
    expect(keywords(v.game, one).has("double-strike")).toBe(false);
  });

  it("Yuriko: during combat nobody casts or activates, mana abilities aside; before it they may", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Yuriko, Blade of the Mighty");
    const mountain = spawn(game, "Mountain");
    const bolt = toHand(game, "Lightning Bolt");
    const pinger = spawn(game, "Prodigal Sorcerer");
    const action = { type: "cast-spell", player: A, card: bolt, targets: [ref(B)] } as const;
    const ping = { type: "activate-ability", player: A, source: pinger, abilityIndex: 0, targets: [ref(B)] } as const;
    expect(game.canDispatch(action)).toBeNull();
    expect(game.canDispatch(ping)).toBeNull();
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A);
    expect(game.canDispatch(action)).not.toBeNull();
    expect(game.canDispatch(ping)).not.toBeNull();
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === mountain)).toBe(true);
  });

  it("Jiang Yanggu: discards, draws, and counts every card you've discarded this turn", () => {
    const t = table({ deck: "Plains" });
    const { game } = t;
    spawn(game, "Jiang Yanggu, Alone");
    const lone = spawn(game, "Grizzly Bears");
    const first = toHand(game, "Grizzly Bears");
    t.a.chooseDiscardsFn = () => [first];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 }, []);
    game.advanceUntil(quiet);
    const second = toHand(game, "Hill Giant");
    t.a.chooseDiscardsFn = () => [second];
    const before = hand(game).length;
    attacking(t, [[lone, B]]);
    expect(counters(game, lone)).toBe(2);
    expect(hand(game).length).toBe(before);
  });

  it("Aurelia: the first attack of the turn untaps and adds a combat, the second doesn't", () => {
    const t = table();
    const { game } = t;
    const aurelia = spawn(game, "Aurelia, the Warleader");
    const bears = spawn(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [aurelia, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.objects[bears].attackedThisTurn === true && quiet(s),
    );
    expect(game.state.objects[bears].tapped).toBe(false);
    game.advanceUntil((s) => (s.turn.combatPhases ?? 0) === 2 && s.turn.step === "declare-attackers" && quiet(s));
    const turn = game.state.turn.number;
    game.advanceUntil((s) => s.turn.number > turn);
    expect(game.state.turn.combatPhases ?? 0).toBe(0);
  });
});

describe("what a declaration of attackers holds", () => {
  it("Fearless Swashbuckler: a Pirate and a Vehicle, draw three and discard two", () => {
    const t = table({ deck: "Plains" });
    const { game } = t;
    const pirate = spawn(game, "Fearless Swashbuckler");
    const vehicle = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(
      A,
      { kind: "add-types", target: 0, addTypes: ["artifact"], addSubtypes: ["Vehicle"], duration: "permanent" },
      [ref(vehicle)],
    );
    game.advanceUntil(quiet);
    expect(keywords(game, vehicle).has("haste")).toBe(true);
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    attacking(t, [
      [pirate, B],
      [vehicle, B],
    ]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Fearless Swashbuckler: a Pirate alone won't do", () => {
    const t = table({ deck: "Plains" });
    const pirate = spawn(t.game, "Fearless Swashbuckler");
    const before = hand(t.game).length;
    attacking(t, [[pirate, B]]);
    expect(hand(t.game).length).toBe(before);
  });

  it("Everett K. Ross: two attacking you, not your planeswalker", () => {
    const t = table({ players: 3, deck: "Plains" });
    const { game } = t;
    spawn(game, "Everett K. Ross, Hapless Attaché", B);
    const walker = spawn(game, "Jace Beleren", B);
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const before = hand(game, B).length;
    attacking(t, [
      [one, B],
      [two, walker],
    ]);
    expect(hand(game, B).length).toBe(before);
  });

  it("Everett K. Ross: two attacking you draws; his commanders get +1/+1 and lifelink", () => {
    const t = table({ deck: "Plains" });
    const { game } = t;
    spawn(game, "Everett K. Ross, Hapless Attaché", B);
    const commander = spawn(game, "Grizzly Bears", B);
    game.state.objects[commander].isCommander = true;
    expect(pt(game, commander)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, commander).has("lifelink")).toBe(true);
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const before = hand(game, B).length;
    attacking(t, [
      [one, B],
      [two, B],
    ]);
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("Firemane Commando: you attacking with two draws you one", () => {
    const t = table({ deck: "Plains" });
    const { game } = t;
    spawn(game, "Firemane Commando");
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const before = hand(game).length;
    attacking(t, [
      [one, B],
      [two, B],
    ]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Firemane Commando: the attacker draws if none of those attacked you, and doesn't if one did", () => {
    const t = table({ players: 3, deck: "Plains" });
    const { game } = t;
    spawn(game, "Firemane Commando", C);
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const before = hand(game).length;
    attacking(t, [
      [one, B],
      [two, B],
    ]);
    expect(hand(game).length).toBe(before + 1);

    const u = table({ players: 3, deck: "Plains" });
    spawn(u.game, "Firemane Commando", C);
    const [three, four] = [spawn(u.game, "Grizzly Bears"), spawn(u.game, "Grizzly Bears")];
    const start = hand(u.game).length;
    attacking(u, [
      [three, B],
      [four, C],
    ]);
    expect(hand(u.game).length).toBe(start);
  });
});

describe("Firemane Commando's 'those creatures': that declaration, not the turn", () => {
  /** Alice's two Bears, Carol's Commando: the first combat at `first`, then a
   * second combat at `second`, untapped between. Returns her hand's growth. */
  const twoCombats = (first: PlayerId, second: PlayerId): number[] => {
    const t = table({ players: 3, deck: "Plains" });
    const { game } = t;
    spawn(game, "Firemane Commando", C);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    t.a.declareAttackersFn = () => {
      const defender = (game.state.turn.combatPhases ?? 1) === 1 ? first : second;
      return bears.map((attacker) => ({ attacker, defender }));
    };
    const start = hand(game).length;
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.objects[bears[0]].attackedThisTurn === true && quiet(s) && s.priority.holder === A,
    );
    const afterFirst = hand(game).length;
    game.debugApplyEffect(A, { kind: "additional-combat", afterThisPhase: true }, []);
    game.advanceUntil(quiet);
    game.advanceUntil((s) => s.turn.step === "end-combat" && s.priority.holder === A);
    for (const id of bears) game.state.objects[id].tapped = false;
    game.advanceUntil((s) => (s.turn.combatPhases ?? 0) === 2 && s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    return [afterFirst - start, hand(game).length - afterFirst];
  };

  it("those that attacked you in the first combat and someone else in the second still draw", () => {
    expect(twoCombats(C, B)).toEqual([0, 1]);
  });

  it("those that attacked someone else first and you second don't", () => {
    expect(twoCombats(B, C)).toEqual([1, 0]);
  });

  it("one of those creatures gone by resolution still attacked you", () => {
    const t = table({ players: 3, deck: "Plains" });
    const { game } = t;
    spawn(game, "Firemane Commando", C);
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    t.a.declareAttackersFn = () => [
      { attacker: one, defender: C },
      { attacker: two, defender: B },
    ];
    const start = hand(game).length;
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(one)]);
    game.advanceUntil(quiet);
    expect(hand(game).length).toBe(start);
  });
});

describe("blocks: how many, by what, and once for the lot", () => {
  it("Seifer: deathtouch when two block a creature attacking an opponent, not one", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Seifer, Balamb Rival");
    const [big, small] = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    const [g1, g2, g3] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    t.a.chooseTargetsFn = () => [ref(g3)];
    t.b.declareBlockersFn = () => [
      { blocker: g1, attacker: big },
      { blocker: g2, attacker: big },
      { blocker: g3, attacker: small },
    ];
    t.a.declareAttackersFn = () => [big, small].map((attacker) => ({ attacker, defender: B }));
    toBlockers(game, g1);
    expect(keywords(game, big).has("deathtouch")).toBe(true);
    expect(keywords(game, small).has("deathtouch")).toBe(false);
  });

  it("Seifer: goads a creature of the player attacked", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Seifer, Balamb Rival");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    t.a.chooseTargetsFn = () => [ref(theirs)];
    attacking(t, [[bears, B]]);
    expect((game.state.objects[theirs].goadedBy ?? []).length).toBeGreaterThan(0);
  });

  it("Serra Inquisitors: +2/+0 blocked by a black creature, once for two; a green one does nothing", () => {
    const t = table();
    const { game } = t;
    const serra = spawn(game, "Serra Inquisitors");
    const [black1, black2] = [spawn(game, "Vampire Nighthawk", B), spawn(game, "Vampire Nighthawk", B)];
    t.a.declareAttackersFn = () => [{ attacker: serra, defender: B }];
    t.b.declareBlockersFn = () => [
      { blocker: black1, attacker: serra },
      { blocker: black2, attacker: serra },
    ];
    toBlockers(game, black1);
    expect(pt(game, serra).power).toBe(5);

    const u = table();
    const other = spawn(u.game, "Serra Inquisitors");
    const green = spawn(u.game, "Grizzly Bears", B);
    u.a.declareAttackersFn = () => [{ attacker: other, defender: B }];
    u.b.declareBlockersFn = () => [{ blocker: green, attacker: other }];
    toBlockers(u.game, green);
    expect(pt(u.game, other).power).toBe(3);
  });

  it("Serra Inquisitors: +2/+0 blocking a black creature", () => {
    const t = table();
    const { game } = t;
    const black = spawn(game, "Walking Corpse");
    const serra = spawn(game, "Serra Inquisitors", B);
    t.a.declareAttackersFn = () => [{ attacker: black, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker: serra, attacker: black }];
    toBlockers(game, serra);
    expect(pt(game, serra).power).toBe(5);
  });

  it("Hezrou: once for all your blocked creatures, each blocking creature -1/-1 whichever it blocks", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Hezrou");
    const [one, two] = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    const [g1, g2] = [spawn(game, "Colossal Dreadmaw", B), spawn(game, "Colossal Dreadmaw", B)];
    t.a.declareAttackersFn = () => [one, two].map((attacker) => ({ attacker, defender: B }));
    t.b.declareBlockersFn = () => [
      { blocker: g1, attacker: one },
      { blocker: g2, attacker: two },
    ];
    toBlockers(game, g1);
    expect(pt(game, g1)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, g2)).toEqual({ power: 5, toughness: 5 });
  });

  it("Hezrou: nothing when nothing of yours is blocked", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Hezrou");
    const one = spawn(game, "Hill Giant");
    const g1 = spawn(game, "Colossal Dreadmaw", B);
    t.a.declareAttackersFn = () => [{ attacker: one, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && quiet(s));
    expect(pt(game, g1)).toEqual({ power: 6, toughness: 6 });
  });

  it("Demonic Stench: each creature that blocked this turn, gone from combat or not", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 1);
    const one = spawn(game, "Hill Giant");
    const g1 = spawn(game, "Colossal Dreadmaw", B);
    const idle = spawn(game, "Colossal Dreadmaw", B);
    t.a.declareAttackersFn = () => [{ attacker: one, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker: g1, attacker: one }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && quiet(s));
    cast(game, toHand(game, "Hezrou"), { face: 1 });
    expect(pt(game, g1)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, idle)).toEqual({ power: 6, toughness: 6 });
    nextTurn(game);
    expect(pt(game, g1)).toEqual({ power: 6, toughness: 6 });
  });
});
