/**
 * The set walk, batch 65, part a (2026-10-12): Avatar: The Last Airbender
 * and Marvel's Spider-Man. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { Step } from "../turn.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;
const free = (card: ObjectId): Cast => ({ type: "cast-spell", player: A, card, targets: [], via: "effect", free: true });

/** `names` on top of alice's library, the first on top. */
const stack = (game: Game, names: readonly string[]): ObjectId[] =>
  [...names].reverse().map((name) => toLibrary(game, name)).reverse();

const castable = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

const canActivate = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

const red = (game: Game): number => game.state.players[A].manaPool.filter((unit) => unit.type === "R").length;

/** At `step` of this combat, with the attack declared and its triggers resolved. */
const at = (game: Game, step: Step): void => {
  game.advanceUntil(
    (s) => s.turn.step === step && s.awaiting === null && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0,
  );
};

describe("The Mechanist, Aerial Artisan", () => {
  it("makes a Clue for a noncreature spell, and turns an artifact token into a 3/1 flying Construct until end of turn", () => {
    const { game } = table();
    const mechanist = spawn(game, "The Mechanist, Aerial Artisan");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const [clue] = named(game, "Clue Token");
    expect(clue).toBeDefined();
    activate(game, mechanist, 0, { targets: [ref(clue)] });
    expect(types(game, clue)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    // Its artifact subtype stays; Construct is its creature type.
    expect(subtypes(game, clue)).toEqual(expect.arrayContaining(["Clue", "Construct"]));
    expect(pt(game, clue)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, clue).has("flying")).toBe(true);
    toStep(game, "end");
    settle(game);
    toStep(game, "precombat-main", B);
    expect(types(game, clue)).not.toContain("creature");
  });

  it("can't target a nontoken artifact", () => {
    const { game } = table();
    const mechanist = spawn(game, "The Mechanist, Aerial Artisan");
    const signet = spawn(game, "Arcane Signet");
    expect(() => activate(game, mechanist, 0, { targets: [ref(signet)] })).toThrow();
  });
});

describe("Solstice Revelations", () => {
  it("offers the free cast only when the spell's mana value is less than your Mountains, else puts it into your hand", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const [island, divination] = stack(game, ["Island", "Divination"]);
    let offered = false;
    let wanted = divination;
    a.chooseCastNowFn = () => {
      offered = true;
      return free(wanted);
    };
    // Divination is mana value 3: not less than three Mountains.
    cast(game, toHand(game, "Solstice Revelations"));
    expect(offered).toBe(false);
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, divination)).toBe("hand");

    // With four Mountains, it's cast for free.
    lands(game, "Mountain", 4);
    const [second] = stack(game, ["Divination"]);
    wanted = second;
    const before = hand(game).length;
    cast(game, toHand(game, "Solstice Revelations"));
    expect(offered).toBe(true);
    expect(zone(game, second)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("How to Start a Riot", () => {
  it("gives the target creature menace and the target player's creatures +2/+0, and costs {1} less under Uncle Iroh", () => {
    const { game } = table();
    spawn(game, "Uncle Iroh");
    lands(game, "Mountain", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const riot = toHand(game, "How to Start a Riot");
    // {2}{R} less {1}: two Mountains pay for it.
    expect(castable(game, riot)).toBe(true);
    cast(game, riot, { targets: [ref(mine), ref(B)] });
    expect(keywords(game, mine).has("menace")).toBe(true);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Momo, Friendly Flier", () => {
  it("takes {1} off the first non-Lemur flying creature spell on your turn only, and grows when a flier enters", () => {
    const { game } = table();
    const momo = spawn(game, "Momo, Friendly Flier");
    lands(game, "Plains", 1);
    // A Lemur with flying doesn't use the discount up.
    cast(game, toHand(game, "Momo, Playful Pet"));
    expect(pt(game, momo)).toEqual({ power: 2, toughness: 2 });
    // Neither does a creature without flying.
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    lands(game, "Island", 2);
    const drake = toHand(game, "Wind Drake");
    expect(castable(game, drake)).toBe(true);
    cast(game, drake);
    expect(pt(game, momo)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Island", 2);
    expect(castable(game, toHand(game, "Wind Drake"))).toBe(false);
  });
});

describe("Suki, Kyoshi Warrior", () => {
  it("has power equal to your creatures and makes an attacking Ally as she attacks", () => {
    const { game, a } = table();
    const suki = spawn(game, "Suki, Kyoshi Warrior");
    expect(pt(game, suki)).toEqual({ power: 1, toughness: 4 });
    attack(game, a, [suki]);
    expect(tokensNamed(game, "Ally Token")).toBe(1);
    // Suki (now 2/4) and the 1/1 Ally both connect.
    expect(life(game, B)).toBe(17);
    expect(pt(game, suki)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Shrines", () => {
  it("The Spirit Oasis draws for each Shrine, itself included, and one more per Shrine after", () => {
    const { game } = table();
    spawn(game, "Southern Air Temple");
    const before = hand(game).length;
    enter(game, "The Spirit Oasis");
    expect(hand(game).length).toBe(before + 2);
    enter(game, "Northern Air Temple");
    expect(hand(game).length).toBe(before + 3);
  });

  it("Southern Air Temple puts X counters on each of your creatures, then one per later Shrine", () => {
    const { game } = table();
    spawn(game, "The Spirit Oasis");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Southern Air Temple");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, theirs)).toBe(0);
    enter(game, "Northern Air Temple");
    expect(counters(game, bears)).toBe(3);
  });

  it("Northern Air Temple drains X, then 1 per later Shrine", () => {
    const { game } = table({ players: 3 });
    spawn(game, "The Spirit Oasis");
    enter(game, "Northern Air Temple");
    expect(life(game, B)).toBe(18);
    expect(game.state.players["carol" as PlayerId].life).toBe(18);
    expect(life(game, A)).toBe(22);
    enter(game, "Southern Air Temple");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });

  it("Kyoshi Island Plaza fetches up to X basic lands tapped, then one per later Shrine", () => {
    const { game, a } = table();
    spawn(game, "The Spirit Oasis");
    let max = -1;
    let picked: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, _min, most) => {
      max = most;
      picked = eligible.slice(0, most);
      return picked;
    };
    enter(game, "Kyoshi Island Plaza");
    // Two Shrines: up to two basic lands, which enter tapped.
    expect(max).toBe(2);
    expect(picked).toHaveLength(2);
    for (const id of picked) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    enter(game, "Northern Air Temple");
    expect(max).toBe(1);
  });

  it("Crescent Island Temple makes a red prowess Monk per Shrine, then one per later Shrine", () => {
    const { game } = table();
    spawn(game, "The Spirit Oasis");
    enter(game, "Crescent Island Temple");
    const MONK = "Monk Token (Crescent Island Temple)";
    expect(tokensNamed(game, MONK)).toBe(2);
    enter(game, "Northern Air Temple");
    expect(tokensNamed(game, MONK)).toBe(3);
    const [monk] = named(game, MONK);
    expect(game.state.objects[monk].stackCount ?? 1).toBeGreaterThanOrEqual(1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    for (const id of named(game, MONK)) expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Fire Nation Attacks", () => {
  it("makes two 2/2 red Soldiers with firebending 1", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Fire Nation Attacks"));
    const SOLDIER = "Soldier Token (Fire Nation Attacks)";
    expect(tokensNamed(game, SOLDIER)).toBe(2);
    nextTurn2(game);
    const [soldier] = named(game, SOLDIER);
    a.declareAttackersFn = () => [{ attacker: soldier, defender: B }];
    at(game, "declare-blockers");
    expect(red(game)).toBe(1);
  });
});

/** To alice's next precombat main (her creatures no longer summoning sick). */
function nextTurn2(game: Game): void {
  toStep(game, "end");
  settle(game);
  toStep(game, "precombat-main");
}

describe("Earth King's Lieutenant", () => {
  it("puts a counter on each other Ally as it enters, and grows as other Allies enter", () => {
    const { game } = table();
    const ally = spawn(game, "Ally Token");
    const bears = spawn(game, "Grizzly Bears");
    const lieutenant = enter(game, "Earth King's Lieutenant");
    expect(counters(game, ally)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, lieutenant)).toBe(0);
    enter(game, "Ally Token");
    expect(counters(game, lieutenant)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, lieutenant)).toBe(1);
  });
});

describe("Waterbending Scroll", () => {
  it("costs {1} less to activate per Island", () => {
    const { game } = table();
    const scroll = spawn(game, "Waterbending Scroll");
    lands(game, "Island", 2);
    // {6} less two: {4}, with two Islands to pay.
    expect(canActivate(game, scroll)).toBe(false);
    lands(game, "Island", 1);
    // {3}, three Islands.
    expect(canActivate(game, scroll)).toBe(true);
    const before = hand(game).length;
    activate(game, scroll);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Sokka, Lateral Strategist", () => {
  it("draws only when another creature attacks beside him", () => {
    const { game, a } = table();
    const sokka = spawn(game, "Sokka, Lateral Strategist");
    const bears = spawn(game, "Grizzly Bears");
    let before = hand(game).length;
    attack(game, a, [sokka]);
    expect(hand(game).length).toBe(before);
    nextTurn2(game);
    before = hand(game).length;
    attack(game, a, [sokka, bears]);
    expect(hand(game).length).toBe(before + 1);
    // Vigilance: still untapped.
    expect(game.state.objects[sokka].tapped).toBe(false);
  });

  it("doesn't draw when only another creature attacks", () => {
    const { game, a } = table();
    spawn(game, "Sokka, Lateral Strategist");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const before = hand(game).length;
    attack(game, a, [bears, giant]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Unlucky Cabbage Merchant", () => {
  it("makes a Food; sacrificing a Food may fetch a tapped basic and shuffles the Merchant into its owner's library", () => {
    const { game, a } = table();
    const merchant = enter(game, "Unlucky Cabbage Merchant");
    const [food] = named(game, "Food Token");
    expect(food).toBeDefined();
    const [forest] = stack(game, ["Forest"]);
    lands(game, "Plains", 2);
    pickModes(a, 0);
    pickFromZone(a, forest);
    activate(game, food);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(zone(game, merchant)).toBe("library");
    expect(life(game)).toBe(23);
  });

  it("stays put when you don't search", () => {
    const { game, a } = table();
    const merchant = enter(game, "Unlucky Cabbage Merchant");
    const [food] = named(game, "Food Token");
    lands(game, "Plains", 2);
    pickModes(a);
    activate(game, food);
    expect(zone(game, merchant)).toBe("battlefield");
  });
});

describe("Sun Warriors", () => {
  it("firebends X, the number of creatures you control", () => {
    const { game, a } = table();
    const warriors = spawn(game, "Sun Warriors");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: warriors, defender: B }];
    at(game, "declare-blockers");
    expect(red(game)).toBe(3);
  });
});

describe("Sokka's Haiku", () => {
  it("counters the spell, draws then mills three, and untaps the land", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    const tapped = game.battlefield.find((id) => game.state.objects[id].tapped && game.state.objects[id].cardName === "Island");
    expect(tapped).toBeDefined();
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    cast(game, toHand(game, "Sokka's Haiku"), { targets: [ref(divination), ref(tapped as ObjectId)] });
    expect(zone(game, divination)).toBe("graveyard");
    // The Haiku (put in the hand after the count) was cast, and one drawn.
    expect(hand(game).length).toBe(handBefore + 1);
    // Divination, three milled and the Haiku itself.
    expect(graveyard(game).length).toBe(graveBefore + 5);
    expect(game.state.objects[tapped as ObjectId].tapped).toBe(false);
  });
});

describe("Ran and Shaw", () => {
  it("cast with three Dragon and/or Lesson cards in your graveyard, makes a nonlegendary token copy", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Firebending Lesson");
    toGraveyard(game, "Earthbending Lesson");
    toGraveyard(game, "Shivan Dragon");
    cast(game, toHand(game, "Ran and Shaw"));
    const both = named(game, "Ran and Shaw");
    expect(both).toHaveLength(2);
    const token = both.find((id) => game.state.objects[id].isToken) as ObjectId;
    expect(token).toBeDefined();
    expect(supertypes(game, token)).not.toContain("legendary");
    expect(keywords(game, token).has("flying")).toBe(true);
  });

  it("makes none with only two, or when put onto the battlefield without being cast", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Firebending Lesson");
    toGraveyard(game, "Shivan Dragon");
    toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Ran and Shaw"));
    expect(named(game, "Ran and Shaw")).toHaveLength(1);

    const fresh = table();
    toGraveyard(fresh.game, "Firebending Lesson");
    toGraveyard(fresh.game, "Earthbending Lesson");
    toGraveyard(fresh.game, "Shivan Dragon");
    enter(fresh.game, "Ran and Shaw");
    expect(named(fresh.game, "Ran and Shaw")).toHaveLength(1);
  });

  it("pumps Dragons you control", () => {
    const { game } = table();
    const ran = spawn(game, "Ran and Shaw");
    const dragon = spawn(game, "Shivan Dragon");
    lands(game, "Mountain", 4);
    activate(game, ran, 0);
    expect(pt(game, ran)).toEqual({ power: 6, toughness: 4 });
    expect(pt(game, dragon)).toEqual({ power: 7, toughness: 5 });
  });
});

describe("Beifong's Bounty Hunters", () => {
  it("earthbends X, the dead creature's power", () => {
    const { game, a } = table();
    spawn(game, "Beifong's Bounty Hunters");
    const giant = spawn(game, "Hill Giant");
    const forest = spawn(game, "Forest");
    pickTargets(a, forest);
    destroy(game, giant);
    expect(types(game, forest)).toContain("creature");
    expect(counters(game, forest)).toBe(3);
    expect(pt(game, forest)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Momo, Playful Pet", () => {
  it("leaving the battlefield, puts a counter on a creature you control (the chosen mode)", () => {
    const { game, a } = table();
    const momo = spawn(game, "Momo, Playful Pet");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, bears);
    destroy(game, momo);
    expect(counters(game, bears)).toBe(1);
    expect(tokensNamed(game, "Food Token")).toBe(0);
  });
});

describe("Ultimate Green Goblin", () => {
  it("discards a card, then makes a Treasure, at your upkeep — the Treasure even with nothing to discard", () => {
    const { game } = table();
    spawn(game, "Ultimate Green Goblin");
    const bolt = toHand(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: hand(game).length - 1 }, []);
    settle(game);
    expect(hand(game)).toEqual([bolt]);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
    // Alice's draw step put a card in her hand: discard it all again.
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: hand(game).length }, []);
    settle(game);
    expect(hand(game)).toHaveLength(0);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Treasure Token")).toBe(2);
  });
});

describe("Web of Life and Destiny", () => {
  it("at the beginning of combat on your turn, may put a creature from the top five onto the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Web of Life and Destiny");
    const [bolt, giant] = stack(game, ["Lightning Bolt", "Hill Giant"]);
    const seen = pickFromZone(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bolt)).toBe("library");
  });
});

// Not from this batch: two pool cards whose "creatures target player controls"
// pumped every creature — `controlledByTarget` rebinds the filter's "you", so
// the filter needs `controlledBy: "you"` to narrow anything.
describe("Great Oak Guardian and Trystan's Command", () => {
  it("Great Oak Guardian pumps and untaps only the target player's creatures", () => {
    const g = table();
    const { game } = g;
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(g.a, B);
    enter(game, "Great Oak Guardian");
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[mine].tapped).toBe(true);
  });

  it("Trystan's Command's pump mode reaches only the target player's creatures", () => {
    const g = table();
    const { game } = g;
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const elf = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Trystan's Command"), { modes: [0, 3], targets: [ref(elf), ref(A)] });
    expect(pt(game, mine)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});
