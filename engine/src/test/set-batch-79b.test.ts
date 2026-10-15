/**
 * Set walk batch 79, part b (2026-10-15): Avatar: The Last Airbender (TLA), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

/** `attackers` attack bob; the game runs to the declare-blockers step with
 * the attack triggers resolved and alice's priority. */
function intoCombat(game: Game, seat: ScriptedController, attackers: readonly ObjectId[]): void {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && quiet(s) && s.priority.holder === A);
}

const red = (game: Game): number => game.state.players[A].manaPool.filter((unit) => unit.type === "R").length;
const library = (game: Game, player = A): number => game.state.zones.perPlayer[player].library.length;
const restrictions = (game: Game, id: ObjectId): readonly string[] => [...game.characteristics(id).restrictions];
const refused = (game: Game, action: Action): boolean => game.canDispatch(action) !== null;

describe("Deadly Precision", () => {
  it("destroys a creature for {B} and {4}", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Deadly Precision"), { targets: [ref(bears)], costOption: 0 });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("or for {B} and a sacrificed artifact or creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Deadly Precision");
    expect(refused(game, { type: "cast-spell", player: A, card, targets: [ref(theirs)], costOption: 0 })).toBe(true);
    cast(game, card, { targets: [ref(theirs)], costOption: 1, sacrifice: mine });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Fire Navy Trebuchet", () => {
  it("makes a tapped and attacking Ballistic Boulder whenever you attack, sacrificed at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Fire Navy Trebuchet");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Ballistic Boulder Token", A)).toBe(1);
    const boulder = named(game, "Ballistic Boulder Token")[0];
    expect(pt(game, boulder)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, boulder).has("flying")).toBe(true);
    expect(game.state.objects[boulder].tapped).toBe(true);
    nextTurn(game);
    expect(tokensNamed(game, "Ballistic Boulder Token")).toBe(0);
  });
});

describe("Barrels of Blasting Jelly", () => {
  it("makes one mana of any color only once each turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const barrels = spawn(game, "Barrels of Blasting Jelly");
    const action: Action = {
      type: "activate-ability",
      player: A,
      source: barrels,
      abilityIndex: 0,
      targets: [],
      manaColors: ["G"],
    };
    game.dispatch(action);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "G")).toHaveLength(1);
    expect(refused(game, action)).toBe(true);
  });

  it("{5}, {T}, sacrifice: 5 damage to target creature", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const barrels = spawn(game, "Barrels of Blasting Jelly");
    const giant = spawn(game, "Colossal Dreadmaw", B);
    activate(game, barrels, 1, { targets: [ref(giant)] });
    expect(zone(game, barrels)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(5);
  });
});

describe("Bumi Bash", () => {
  it("deals damage equal to the lands you control", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Wastes", 1);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Bumi Bash"), { modes: [0], targets: [ref(dreadmaw)] });
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
  });

  it("destroys a land creature or a nonbasic land, never a plain basic", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const tower = spawn(game, "Command Tower", B);
    const forest = spawn(game, "Forest", B);
    const animated = spawn(game, "Forest", B);
    game.debugApplyEffect(B, { kind: "earthbend", target: 0, amount: 1 }, [ref(animated)]);
    settle(game);
    const card = toHand(game, "Bumi Bash");
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === card);
    const options =
      offer?.kind === "cast-spell"
        ? (offer.castModal?.modes[1].targetOptions[0] ?? []).map((t) => (t.kind === "object" ? t.object : t.player))
        : [];
    expect(options).toEqual(expect.arrayContaining([tower, animated]));
    expect(options).not.toContain(forest);
    expect(() =>
      game.dispatch({ type: "cast-spell", player: A, card, targets: [ref(forest)], modes: [1] }),
    ).toThrow(/illegal target/);
    cast(game, card, { modes: [1], targets: [ref(tower)] });
    expect(zone(game, tower)).toBe("graveyard");
  });
});

describe("Yip Yip!", () => {
  it("+2/+2, and flying only for an Ally", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const ally = makeToken(game, "Ally Token");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Yip Yip!"), { targets: [ref(ally)] });
    expect(pt(game, ally)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, ally).has("flying")).toBe(true);
    cast(game, toHand(game, "Yip Yip!"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Earth Kingdom Jailer", () => {
  it("exiles an opponent's permanent of mana value 3 or more until it leaves", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    const seen = watchTargets(a, () => [giant]);
    const jailer = enter(game, "Earth Kingdom Jailer");
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, jailer);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });

  it("may exile nothing", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    watchTargets(a, () => [null]);
    enter(game, "Earth Kingdom Jailer");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Ty Lee, Artful Acrobat", () => {
  it("pays {1} as she attacks so a creature can't block", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const tyLee = spawn(game, "Ty Lee, Artful Acrobat");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    const offer = blockOffer(game, a, [tyLee]);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).not.toContain(tyLee);
    expect(canBlock(giant)).toContain(tyLee);
  });

  it("does nothing when the {1} isn't paid", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    const tyLee = spawn(game, "Ty Lee, Artful Acrobat");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    const offer = blockOffer(game, a, [tyLee]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).toContain(tyLee);
  });
});

describe("Joo Dee, One of Many", () => {
  it("surveils, copies itself, then sacrifices an artifact or creature of its controller's choice", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const joo = spawn(game, "Joo Dee, One of Many");
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [joo];
    };
    activate(game, joo, 0);
    expect(offered).toContain(joo);
    expect(offered).toHaveLength(2);
    expect(zone(game, joo)).toBe("graveyard");
    const copies = named(game, "Joo Dee, One of Many");
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].isToken).toBe(true);
  });
});

describe("Vindictive Warden", () => {
  it("{3}: 1 damage to each opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Wastes", 3);
    const warden = spawn(game, "Vindictive Warden");
    activate(game, warden, 0);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("firebending 1 as it attacks", () => {
    const { game, a } = table();
    const warden = spawn(game, "Vindictive Warden");
    intoCombat(game, a, [warden]);
    expect(red(game)).toBe(1);
  });
});

describe("Master Pakku", () => {
  it("target player mills one card for each Lesson card in your graveyard when it becomes tapped", () => {
    const { game, a } = table();
    toGraveyard(game, "Earthbending Lesson");
    toGraveyard(game, "Yip Yip!");
    toGraveyard(game, "Grizzly Bears");
    const pakku = spawn(game, "Master Pakku");
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(pakku)]);
    settle(game);
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Compassionate Healer", () => {
  it("gains 1 life and scries 1 whenever it becomes tapped", () => {
    const { game } = table();
    const healer = spawn(game, "Compassionate Healer");
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(healer)]);
    settle(game);
    expect(life(game)).toBe(21);
  });
});

describe("Fire Nation Cadets", () => {
  it("has no firebending without a Lesson card in your graveyard", () => {
    const { game, a } = table();
    const cadets = spawn(game, "Fire Nation Cadets");
    intoCombat(game, a, [cadets]);
    expect(red(game)).toBe(0);
  });

  it("firebending 2 with one", () => {
    const { game, a } = table();
    toGraveyard(game, "Earthbending Lesson");
    const cadets = spawn(game, "Fire Nation Cadets");
    intoCombat(game, a, [cadets]);
    expect(red(game)).toBe(2);
  });

  it("{2}: +1/+0", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const cadets = spawn(game, "Fire Nation Cadets");
    activate(game, cadets, 0);
    expect(pt(game, cadets)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Cruel Administrator", () => {
  const castIt = (game: Game): ObjectId => {
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 3);
    const card = toHand(game, "Cruel Administrator");
    cast(game, card);
    return card;
  };

  it("enters without a counter if you haven't attacked", () => {
    const { game } = table();
    const admin = castIt(game);
    expect(counters(game, admin)).toBe(0);
    expect(pt(game, admin)).toEqual({ power: 5, toughness: 4 });
  });

  it("raid: enters with a +1/+1 counter if you attacked this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    const admin = castIt(game);
    expect(counters(game, admin)).toBe(1);
  });

  it("makes a 2/2 red Soldier with firebending 1 whenever it attacks", () => {
    const { game, a } = table();
    const admin = spawn(game, "Cruel Administrator");
    attack(game, a, [admin]);
    expect(tokensNamed(game, "Soldier Token (Fire Nation Attacks)", A)).toBe(1);
  });
});

describe("The Lion-Turtle", () => {
  it("gains 3 life, and can't attack or block until three Lesson cards are in your graveyard", () => {
    const { game } = table();
    const turtle = enter(game, "The Lion-Turtle");
    expect(life(game)).toBe(23);
    expect(restrictions(game, turtle)).toEqual(expect.arrayContaining(["cant-attack", "cant-block"]));
    toGraveyard(game, "Earthbending Lesson");
    toGraveyard(game, "Yip Yip!");
    expect(restrictions(game, turtle)).toContain("cant-attack");
    toGraveyard(game, "Ozai's Cruelty");
    expect(restrictions(game, turtle)).not.toContain("cant-attack");
    expect(restrictions(game, turtle)).not.toContain("cant-block");
  });

  it("counts only your own graveyard", () => {
    const { game } = table();
    const turtle = spawn(game, "The Lion-Turtle");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Earthbending Lesson", B);
    expect(restrictions(game, turtle)).toContain("cant-attack");
  });
});

describe("Walltop Sentries", () => {
  it("gains 2 life as it dies only with a Lesson card in your graveyard", () => {
    const { game } = table();
    const sentries = spawn(game, "Walltop Sentries");
    destroy(game, sentries);
    expect(life(game)).toBe(20);
    toGraveyard(game, "Earthbending Lesson");
    const again = spawn(game, "Walltop Sentries");
    destroy(game, again);
    expect(life(game)).toBe(22);
  });
});

describe("Kyoshi Battle Fan", () => {
  it("makes a 1/1 white Ally and attaches to it", () => {
    const { game } = table();
    const fan = enter(game, "Kyoshi Battle Fan");
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
    const ally = named(game, "Ally Token")[0];
    expect(game.state.objects[fan].attachedTo).toBe(ally);
    expect(pt(game, ally)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Leaves from the Vine", () => {
  it("mills three and makes a Food, counters up to two creatures, then draws if a creature or Lesson is in your graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    const saga = toHand(game, "Leaves from the Vine");
    cast(game, saga);
    expect(graveyard(game)).toHaveLength(3);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);

    pickTargets(a, one, two);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);

    // Only lands were milled: no draw.
    nextTurn(game);
    const before = library(game);
    nextTurn(game);
    settle(game);
    expect(library(game)).toBe(before - 1);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("chapter III draws with a Lesson card in your graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Leaves from the Vine"));
    nextTurn(game);
    nextTurn(game);
    settle(game);
    toGraveyard(game, "Earthbending Lesson");
    nextTurn(game);
    const before = library(game);
    nextTurn(game);
    settle(game);
    expect(library(game)).toBe(before - 2);
  });
});

describe("Dai Li Indoctrination", () => {
  it("takes a nonland permanent card from the opponent's hand", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = toHand(game, "Grizzly Bears", B);
    const wastes = toHand(game, "Wastes", B);
    const bolt = toHand(game, "Ozai's Cruelty", B);
    cast(game, toHand(game, "Dai Li Indoctrination"), { modes: [0], targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wastes)).toBe("hand");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("or earthbends 2", () => {
    const { game } = table();
    const [land] = lands(game, "Swamp", 3);
    cast(game, toHand(game, "Dai Li Indoctrination"), { modes: [1], targets: [ref(land)] });
    expect(counters(game, land)).toBe(2);
    expect(pt(game, land)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, land).has("haste")).toBe(true);
  });
});

describe("Air Nomad Legacy", () => {
  it("makes a Clue, and your fliers get +1/+1", () => {
    const { game } = table();
    const crow = spawn(game, "Storm Crow");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Storm Crow", B);
    enter(game, "Air Nomad Legacy");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(pt(game, crow)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Jet's Brainwashing", () => {
  it("unkicked: the creature can't block, and you get a Clue", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Jet's Brainwashing"), { targets: [ref(bears)] });
    expect(restrictions(game, bears)).toContain("cant-block");
    expect(controller(game, bears)).toBe(B);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("kicked: you also take it until end of turn, untapped and hasty", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true, sick: true });
    cast(game, toHand(game, "Jet's Brainwashing"), { targets: [ref(bears)], kicked: true });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(restrictions(game, bears)).toContain("cant-block");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Mai, Jaded Edge", () => {
  it("exhaust: a double strike counter, once", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const mai = spawn(game, "Mai, Jaded Edge");
    activate(game, mai, 0);
    expect(counters(game, mai, "double-strike")).toBe(1);
    expect(keywords(game, mai).has("double-strike")).toBe(true);
    expect(() => activate(game, mai, 0)).toThrow();
  });
});

describe("Ozai's Cruelty", () => {
  it("2 damage to target player, who discards two cards", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    for (let i = 0; i < 3; i += 1) toHand(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Ozai's Cruelty"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game, B)).toHaveLength(before - 2);
  });
});
describe("Boiling Rock Rioter", () => {
  it("taps an Ally to exile a graveyard card, and casts an Ally card you own exiled with it as it attacks", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const rioter = spawn(game, "Boiling Rock Rioter");
    const allyOne = makeToken(game, "Ally Token");
    const allyTwo = makeToken(game, "Ally Token");
    const mine = toGraveyard(game, "Compassionate Healer");
    const theirs = toGraveyard(game, "Compassionate Healer", B);
    const exile = (target: ObjectId, tap: ObjectId): void => {
      game.dispatch({
        type: "activate-ability",
        player: A,
        source: rioter,
        abilityIndex: 0,
        targets: [ref(target)],
        tap: [tap],
      });
      settle(game);
    };
    exile(mine, allyOne);
    exile(theirs, allyTwo);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");

    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.casts.map((c) => c.card);
      const way = offer.casts.find((c) => c.card === mine);
      return way === undefined ? null : { type: "cast-spell", player: A, card: mine, targets: [], via: way.via };
    };
    attack(game, a, [rioter]);
    expect(offered).toContain(mine);
    expect(offered).not.toContain(theirs);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("exile");
  });

  it("can tap itself to pay", () => {
    const { game } = table();
    const rioter = spawn(game, "Boiling Rock Rioter", A, { sick: true });
    const card = toGraveyard(game, "Grizzly Bears", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: rioter,
      abilityIndex: 0,
      targets: [ref(card)],
      tap: [rioter],
    });
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[rioter].tapped).toBe(true);
  });
});

