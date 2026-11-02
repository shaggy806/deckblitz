/**
 * What a permanent has dealt damage to (`GameObject.dealtDamage`): the filter
 * clause `dealtDamageThisTurn`, the condition `self-hasnt-dealt-damage`, and
 * the Sengir Vampire shape they sit beside.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  controller,
  grant,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`, its controller's doing. */
function deal(game: Game, by: PlayerId, source: ObjectId, to: PlayerId | ObjectId, amount = 1): void {
  game.debugApplyEffect(by, { kind: "damage", target: 0, amount }, [ref(to)], { source });
  settle(game);
}

/** The seat sacrifices `pick`, recording what each sacrifice offered it. */
function sacrificesOffered(seat: ScriptedController, pick: ObjectId): (readonly ObjectId[])[] {
  const offered: (readonly ObjectId[])[] = [];
  seat.chooseSacrificesFn = (_view, eligible) => {
    offered.push(eligible);
    return [pick];
  };
  return offered;
}

describe("a creature that dealt damage to you this turn", () => {
  it("Reciprocate exiles it, and can target nothing else", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Hill Giant", B);
    deal(game, B, theirs, A);
    lands(game, "Plains", 1);
    const spell = toHand(game, "Reciprocate");
    expect(() => cast(game, spell, { targets: [ref(other)] })).toThrow();
    cast(game, spell, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
  });

  it("damage to another player or to a creature isn't damage to you", () => {
    const { game } = table({ players: 3 });
    const toOther = spawn(game, "Grizzly Bears", B);
    const toCreature = spawn(game, "Hill Giant", B);
    const blocker = spawn(game, "Hill Giant", C);
    const toYou = spawn(game, "Goblin Piker", B);
    deal(game, B, toOther, C);
    deal(game, B, toCreature, blocker);
    deal(game, B, toYou, A);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Retaliate"));
    expect(zone(game, toOther)).toBe("battlefield");
    expect(zone(game, toCreature)).toBe("battlefield");
    expect(zone(game, toYou)).toBe("graveyard");
  });

  it("combat damage counts, and an attacker that was blocked dealt none to the player", () => {
    const { game, a, b } = table();
    const mine = spawn(game, "Grizzly Bears");
    const blocked = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker, attacker: blocked }];
    attack(game, a, [mine, blocked]);
    expect(game.state.objects[mine].dealtDamage).toMatchObject({ combat: true });
    expect(game.state.objects[mine].dealtDamage?.thisTurn?.combatPlayers).toEqual([B]);
    expect(game.state.objects[blocker].dealtDamage?.thisTurn?.players).toEqual([]);
    expect(game.state.objects[blocker].dealtDamage?.combat).toBe(true);
  });

  it("damage that was prevented wasn't dealt", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "prevent-damage-to-you", by: { type: "creature" } });
    settle(game);
    deal(game, B, theirs, A);
    expect(game.state.objects[theirs].dealtDamage).toBeUndefined();
  });

  it("is only this turn's: the record clears as the next turn begins", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    deal(game, B, theirs, A);
    expect(game.state.objects[theirs].dealtDamage?.thisTurn?.players).toEqual([A]);
    nextTurn(game);
    expect(game.state.objects[theirs].dealtDamage?.thisTurn).toBeUndefined();
    expect(game.state.objects[theirs].dealtDamage).toBeDefined();
  });

  it("a creature that left the battlefield is a new object, with no record", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    deal(game, B, theirs, A);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(game.state.objects[theirs].dealtDamage).toBeUndefined();
  });

  it("Spear of Heliod: +1/+1, and {1}{W}{W}, {T} destroys one", () => {
    const { game } = table();
    const spear = spawn(game, "Spear of Heliod");
    const mine = spawn(game, "Grizzly Bears");
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    const theirs = spawn(game, "Hill Giant", B);
    deal(game, B, theirs, A);
    lands(game, "Plains", 3);
    activate(game, spear, 0, { targets: [ref(theirs)] });
    expect(graveyard(game, B)).toContain(theirs);
  });
});

describe("a creature that dealt damage this turn", () => {
  it("Restore the Peace: to a player or a creature, either side, to its owner's hand", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const idle = spawn(game, "Goblin Piker", B);
    deal(game, A, mine, theirs);
    deal(game, B, theirs, A);
    lands(game, "Tundra", 3);
    cast(game, toHand(game, "Restore the Peace"));
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
    expect(zone(game, idle)).toBe("battlefield");
  });

  it("a creature only dealt damage by something else hasn't dealt any", () => {
    const { game } = table();
    const dealer = spawn(game, "Grizzly Bears");
    const dealtTo = spawn(game, "Hill Giant", B);
    deal(game, A, dealer, dealtTo);
    expect(game.state.objects[dealer].dealtDamage?.thisTurn).toBeDefined();
    expect(game.state.objects[dealtTo].dealtDamage).toBeUndefined();
  });

  it("Red Guardian: only an opponent's", () => {
    const { game, a } = table();
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    const theirs2 = spawn(game, "Hill Giant", B);
    const idle = spawn(game, "Goblin Piker", B);
    deal(game, A, mine, theirs);
    deal(game, B, theirs, mine);
    deal(game, B, theirs2, A);
    lands(game, "Plains", 3);
    const seen = watchTargets(a, () => [theirs]);
    cast(game, toHand(game, "Red Guardian, Super-Soldier"));
    expect(seen.offered).toEqual([[theirs, theirs2]]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, idle)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("as long as it hasn't dealt damage yet", () => {
  it("Karakyk Guardian loses hexproof for good once it has, noncombat or combat", () => {
    const { game } = table();
    const guardian = spawn(game, "Karakyk Guardian");
    expect(keywords(game, guardian).has("hexproof")).toBe(true);
    deal(game, A, guardian, B);
    expect(keywords(game, guardian).has("hexproof")).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(keywords(game, guardian).has("hexproof")).toBe(false);
  });

  it("Ruric Thar keeps it through noncombat damage, and loses it to combat damage", () => {
    const { game, a } = table();
    const ruric = spawn(game, "Ruric Thar, Magecrusher");
    deal(game, A, ruric, B);
    expect(keywords(game, ruric).has("hexproof")).toBe(true);
    attack(game, a, [ruric]);
    expect(keywords(game, ruric).has("hexproof")).toBe(false);
  });

  it("Ruric Thar can't be countered as a spell", () => {
    const { game } = table();
    expect(game.registry.get("Ruric Thar, Magecrusher").cantBeCountered).toBe(true);
  });
});

describe("a creature dealt damage by this creature this turn dies", () => {
  it("Soul Collector returns that card under your control", () => {
    const { game, a, b } = table();
    const collector = spawn(game, "Soul Collector");
    const victim = spawn(game, "Grizzly Bears", B);
    grant(game, victim, "reach");
    b.declareBlockersFn = () => [{ blocker: victim, attacker: collector }];
    attack(game, a, [collector]);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    expect(controller(game, back)).toBe(A);
    expect(game.state.objects[back].owner).toBe(B);
  });

  it("not one it didn't damage", () => {
    const { game } = table();
    spawn(game, "Soul Collector");
    const victim = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", A)).toEqual([]);
  });

  it("nothing returns of a token", () => {
    const { game, a, b } = table();
    const collector = spawn(game, "Soul Collector");
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    const [soldier] = named(game, "Soldier Token", B);
    grant(game, soldier, "reach");
    b.declareBlockersFn = () => [{ blocker: soldier, attacker: collector }];
    attack(game, a, [collector]);
    expect(named(game, "Soldier Token", B)).toEqual([]);
    expect(named(game, "Soldier Token", A)).toEqual([]);
  });
});

describe("Witch-king of Angmar", () => {
  it("each opponent sacrifices one that dealt combat damage to you, of their choice", () => {
    const { game, b } = table();
    spawn(game, "Witch-king of Angmar");
    const hitter = spawn(game, "Hill Giant", B);
    const hitter2 = spawn(game, "Grizzly Bears", B);
    const idle = spawn(game, "Goblin Piker", B);
    toStep(game, "precombat-main", B);
    const offered = sacrificesOffered(b, hitter2);
    attack(game, b, [hitter, hitter2], A);
    settle(game);
    expect(offered).toEqual([[hitter, hitter2]]);
    expect(zone(game, hitter2)).toBe("graveyard");
    expect(zone(game, hitter)).toBe("battlefield");
    expect(zone(game, idle)).toBe("battlefield");
  });

  it("discard a card: indestructible until end of turn, and tapped", () => {
    const { game } = table();
    const king = spawn(game, "Witch-king of Angmar");
    toHand(game, "Wastes");
    activate(game, king, 0);
    expect(keywords(game, king).has("indestructible")).toBe(true);
    expect(game.state.objects[king].tapped).toBe(true);
  });

  it("the Ring tempts you, whatever is sacrificed", () => {
    const { game, b } = table();
    spawn(game, "Witch-king of Angmar");
    const hitter = spawn(game, "Hill Giant", B);
    toStep(game, "precombat-main", B);
    attack(game, b, [hitter], A);
    settle(game);
    expect(zone(game, hitter)).toBe("graveyard");
    expect(game.state.players[A].ringTemptations).toBe(1);
  });

  it("only what dealt combat damage to you, not noncombat damage or to another player", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Witch-king of Angmar");
    const pinger = spawn(game, "Goblin Piker", B);
    const hitter = spawn(game, "Hill Giant", B);
    const atOther = spawn(game, "Grizzly Bears", B);
    const third = spawn(game, "Grizzly Bears", C);
    toStep(game, "precombat-main", B);
    deal(game, B, pinger, A);
    expect(zone(game, pinger)).toBe("battlefield");
    b.declareAttackersFn = () => [
      { attacker: hitter, defender: A },
      { attacker: atOther, defender: C },
    ];
    const offered = sacrificesOffered(b, hitter);
    const offeredC = sacrificesOffered(c, third);
    toStep(game, "postcombat-main", B);
    settle(game);
    expect(offered.flat()).not.toContain(atOther);
    expect(offered.flat()).not.toContain(pinger);
    expect(offeredC).toEqual([]);
    expect(zone(game, hitter)).toBe("graveyard");
    expect(zone(game, pinger)).toBe("battlefield");
    expect(zone(game, third)).toBe("battlefield");
    expect(zone(game, atOther)).toBe("battlefield");
  });
});
