/**
 * Batch 261, group A: cards freed by the need-keys families (static grants,
 * graveyard casting, cost modification, look-and-choose and more). One test
 * for the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import { faceName } from "../state.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { LegalAction } from "../actions.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
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
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

const graveyardCasts = (game: Game, card: ObjectId, player: PlayerId = A): LegalAction[] =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): LegalAction[] =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);
/** Bob casts Mind Rot at alice on his turn; she discards `cards`. */
const mindRot = (game: Game, a: { chooseDiscardsFn: unknown }, cards: readonly ObjectId[]): void => {
  if (game.state.turn.number === 1) nextTurn(game);
  lands(game, "Swamp", 3, B);
  (a as { chooseDiscardsFn: () => readonly ObjectId[] }).chooseDiscardsFn = () => cards;
  for (const id of [...hand(game)]) if (!cards.includes(id)) game.debugMove(id, "library");
  cast(game, toHand(game, "Mind Rot", B), { player: B, targets: [ref(A)] });
};
const stackAndPending = (game: Game): number => game.state.zones.shared.stack.length + game.state.pendingTriggers.length;

describe("statics that stop targeting, blocking and damage", () => {
  it("Artifact Ward: an artifact source's ability can't target it, and its damage is prevented", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Artifact Ward"), { targets: [ref(bear)] });
    const rod = spawn(game, "Rod of Ruin");
    lands(game, "Wastes", 3);
    expect(() => activate(game, rod, 0, { targets: [ref(bear)] })).toThrow();
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bear)], { source: spawn(game, "Su-Chi", B) });
    expect(game.state.objects[bear].damageMarked).toBe(0);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bear)], { source: spawn(game, "Hill Giant", B) });
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });

  it("Spectral Shield: no spell can target it, its controller's included; abilities still can", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Spectral Shield"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 4 });
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bear)] })).toThrow();
    lands(game, "Wastes", 3);
    activate(game, spawn(game, "Rod of Ruin"), 0, { targets: [ref(bear)] });
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });

  it("Tetsuo Umezawa destroys a blocking creature but not an untapped, unblocking one", () => {
    const { game } = table();
    const tetsuo = spawn(game, "Tetsuo Umezawa");
    lands(game, "Swamp", 2);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const untapped = spawn(game, "Hill Giant", B);
    expect(() => activate(game, tetsuo, 0, { targets: [ref(untapped)] })).toThrow();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    activate(game, tetsuo, 0, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });

  it("Intercessor's Arrest: the enchanted creature can't crew", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Intercessor's Arrest"), { targets: [ref(giant)] });
    const tardis = spawn(game, "TARDIS");
    expect(() => activate(game, tardis, 0)).toThrow();
    spawn(game, "Grizzly Bears");
    activate(game, tardis, 0);
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});

describe("life totals as P/T", () => {
  it("Ajani Goldmane's −6 Avatar is as big as your life total, and follows it", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    loyalty(game, ajani, -6, { atLeast: 6 });
    const [avatar] = named(game, "Avatar Token");
    expect(pt(game, avatar)).toEqual({ power: 20, toughness: 20 });
    game.debugApplyEffect(A, { kind: "lose-life", amount: 5 });
    expect(pt(game, avatar)).toEqual({ power: 15, toughness: 15 });
  });
});

describe("the chosen type, read by a trigger", () => {
  it("Kindred Discovery draws when a creature of the chosen type enters or attacks, not another", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    lands(game, "Island", 5);
    cast(game, toHand(game, "Kindred Discovery"));
    const before = hand(game).length;
    const bear = enter(game, "Grizzly Bears");
    enter(game, "Hill Giant");
    expect(hand(game).length).toBe(before + 1);
    attack(game, a, [bear]);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("the top of the library", () => {
  it("Conspicuous Snoop casts a Goblin from the top, not a non-Goblin", () => {
    const { game } = table();
    spawn(game, "Conspicuous Snoop");
    lands(game, "Mountain", 2);
    const bear = toLibrary(game, "Grizzly Bears");
    expect(castOffers(game, bear)).toEqual([]);
    game.debugMove(bear, "graveyard");
    const guide = toLibrary(game, "Goblin Guide");
    cast(game, guide, { via: "library-top" });
    expect(zone(game, guide)).toBe("battlefield");
  });
});

describe("cascade granted to the next spell", () => {
  it("Smoldering Stagecoach: only the next instant cascades, not a second", () => {
    const { game, a } = table({ deck: "Ornithopter" });
    const coach = spawn(game, "Smoldering Stagecoach");
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, coach).power).toBe(1);
    spawn(game, "Hill Giant");
    activate(game, coach, 0);
    attack(game, a, [coach]);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    expect(stackAndPending(game)).toBe(2);
    settle(game);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    expect(stackAndPending(game)).toBe(1);
  });

  it("TARDIS grants nothing without a Time Lord", () => {
    const { game, a } = table({ deck: "Ornithopter" });
    const tardis = spawn(game, "TARDIS");
    spawn(game, "Hill Giant");
    activate(game, tardis, 0);
    attack(game, a, [tardis]);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    expect(stackAndPending(game)).toBe(1);
  });
});

describe("transform and persist", () => {
  it("Eirdu transforms for {B}; Isilu gives another nontoken creature persist", () => {
    const { game, a: seatA } = table();
    const { a } = { a: seatA };
    const eirdu = spawn(game, "Eirdu, Carrier of Dawn");
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game, "postcombat-main");
    expect(faceName(game.state.objects[eirdu])).toBe("Isilu, Carrier of Twilight");
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    const [back] = named(game, "Grizzly Bears");
    expect(back).toBeDefined();
    expect(counters(game, back, "-1/-1")).toBe(1);
  });
});

describe("exile and play", () => {
  it("Hoarding Broodlord: the found card may be played from exile, with convoke", () => {
    const { game, a } = table();
    const bear = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = () => [bear];
    enter(game, "Hoarding Broodlord");
    expect(zone(game, bear)).toBe("exile");
    spawn(game, "Hill Giant");
    spawn(game, "Llanowar Elves");
    const offers = castOffers(game, bear);
    expect(offers.length).toBeGreaterThan(0);
  });

  it("Caetus untaps up to four target creatures at your end step", () => {
    const { game, a } = table();
    const caetus = spawn(game, "Invasion of Segovia");
    game.state.objects[caetus].face = 1;
    expect(faceName(game.state.objects[caetus])).toBe("Caetus, Sea Tyrant of Segovia");
    const bears = [spawn(game, "Grizzly Bears", A, { tapped: true }), spawn(game, "Hill Giant", A, { tapped: true })];
    a.chooseTargetsFn = () => bears.map(ref);
    toStep(game, "end");
    settle(game);
    expect(bears.map((id) => game.state.objects[id].tapped)).toEqual([false, false]);
  });
});

describe("the Saga's second chapter", () => {
  it("Behold the Unspeakable II draws four with one or fewer cards in hand", () => {
    const { game } = table();
    for (const id of [...hand(game)].slice(1)) game.debugMove(id, "library");
    const saga = enter(game, "Behold the Unspeakable");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(hand(game).length).toBe(5);
  });
});

describe("when this card is discarded", () => {
  it("Edgar's Awakening: paying {B} returns a creature card to hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bear = toGraveyard(game, "Grizzly Bears");
    const edgar = toHand(game, "Edgar's Awakening");
    a.chooseDiscardsFn = () => [edgar];
    pickModes(a, 0);
    pickTargets(a, bear);
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, bear)).toBe("hand");
  });

  it("Ajani's Last Stand: discarded by an opponent's effect makes an Avatar only with a Plains", () => {
    const { game, a } = table();
    mindRot(game, a, [toHand(game, "Ajani's Last Stand"), toHand(game, "Wastes")]);
    expect(tokensNamed(game, "Avatar Token (4/4 Flying)")).toBe(0);
    spawn(game, "Plains");
    mindRot(game, a, [toHand(game, "Ajani's Last Stand"), toHand(game, "Wastes")]);
    expect(tokensNamed(game, "Avatar Token (4/4 Flying)")).toBe(1);
  });

  it("Ajani's Last Stand: sacrificed as a creature dies, it makes one Avatar", () => {
    const { game, a } = table();
    const stand = spawn(game, "Ajani's Last Stand");
    pickModes(a, 0);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(zone(game, stand)).toBe("graveyard");
    expect(tokensNamed(game, "Avatar Token (4/4 Flying)")).toBe(1);
  });

  it("Mangara's Blessing: 2 life now, back to hand at the next end step", () => {
    const { game, a } = table();
    const blessing = toHand(game, "Mangara's Blessing");
    mindRot(game, a, [blessing, toHand(game, "Wastes")]);
    expect(life(game)).toBe(22);
    expect(zone(game, blessing)).toBe("graveyard");
    nextTurn(game);
    expect(zone(game, blessing)).toBe("hand");
  });

  it("Mangara's Blessing: not returned once it has left the graveyard and come back", () => {
    const { game, a } = table();
    const blessing = toHand(game, "Mangara's Blessing");
    mindRot(game, a, [blessing, toHand(game, "Wastes")]);
    expect(life(game)).toBe(22);
    game.debugMove(blessing, "exile");
    game.debugMove(blessing, "graveyard");
    nextTurn(game);
    expect(zone(game, blessing)).toBe("graveyard");
  });

  it("Sand Golem: discarded by an opponent, it returns with a +1/+1 counter at the end step; not by you", () => {
    const { game, a } = table();
    const golem = toHand(game, "Sand Golem");
    a.chooseDiscardsFn = () => [golem];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    nextTurn(game);
    expect(zone(game, golem)).toBe("graveyard");
    mindRot(game, a, [toHand(game, "Sand Golem"), toHand(game, "Wastes")]);
    expect(named(game, "Sand Golem").length).toBe(0);
    nextTurn(game);
    const [back] = named(game, "Sand Golem");
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(1);
  });
});

describe("discards this turn", () => {
  it("Tinybones draws only if an opponent discarded this turn", () => {
    const { game, b } = table();
    spawn(game, "Tinybones, Trinket Thief");
    toStep(game, "end");
    settle(game);
    const before = hand(game).length;
    expect(life(game)).toBe(20);
    nextTurn(game);
    b.chooseDiscardsFn = (h) => [h[0].id];
    game.debugApplyEffect(A, { kind: "discard", target: "each-opponent", amount: 1 });
    toStep(game, "end", B);
    settle(game);
    expect(life(game)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Tinybones's drain hits only opponents with empty hands", () => {
    const { game } = table({ players: 3 });
    const bones = spawn(game, "Tinybones, Trinket Thief");
    for (const id of [...hand(game, B)]) game.debugMove(id, "library");
    lands(game, "Swamp", 6);
    activate(game, bones, 0);
    expect(life(game, B)).toBe(10);
    expect(game.state.players[C].life).toBe(20);
  });

  it("Veronica: one Junk for the first nonland discard of the turn, after a land discard", () => {
    const { game, a } = table();
    spawn(game, "Veronica, Dissident Scribe");
    const land = toHand(game, "Wastes");
    a.chooseDiscardsFn = () => [land];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Junk Token")).toBe(0);
    for (const name of ["Grizzly Bears", "Hill Giant"]) {
      const card = toHand(game, name);
      a.chooseDiscardsFn = () => [card];
      game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
      settle(game);
    }
    expect(tokensNamed(game, "Junk Token")).toBe(1);
  });
});

describe("cast from the graveyard by its own costs", () => {
  it("Squee, Dubious Monarch: {3}{R} and four other cards exiled", () => {
    const { game } = table();
    const squee = toGraveyard(game, "Squee, Dubious Monarch");
    const others = ["Grizzly Bears", "Hill Giant", "Shock", "Wastes"].map((n) => toGraveyard(game, n));
    lands(game, "Mountain", 3);
    expect(graveyardCasts(game, squee)).toEqual([]);
    lands(game, "Mountain", 1);
    cast(game, squee, { via: "graveyard-permission", escapeExile: others });
    expect(zone(game, squee)).toBe("battlefield");
    expect(others.every((id) => zone(game, id) === "exile")).toBe(true);
  });

  it("Alien Symbiosis: cast from the graveyard by discarding a card", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    const aura = toGraveyard(game, "Alien Symbiosis");
    const card = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [card];
    cast(game, aura, { via: "graveyard-permission", targets: [ref(bear)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("menace")).toBe(true);
  });
});

describe("cards put into a graveyard from the battlefield this turn", () => {
  it("Brought Back returns only a card that died this turn, tapped", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    const old = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 2);
    void a;
    expect(() => cast(game, toHand(game, "Brought Back"), { targets: [ref(old)] })).toThrow();
    cast(game, toHand(game, "Brought Back"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("Gerrard: exiled, and the creature cards that died this turn come back", () => {
    const { game } = table();
    const gerrard = spawn(game, "Gerrard, Weatherlight Hero");
    const bear = spawn(game, "Grizzly Bears");
    const old = toGraveyard(game, "Hill Giant");
    destroy(game, bear);
    destroy(game, gerrard);
    expect(zone(game, gerrard)).toBe("exile");
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, old)).toBe("graveyard");
  });

  it("Lobelia: Treasures equal to the exiled card's power", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, giant, A);
    pickTargets(a, giant);
    enter(game, "Lobelia Sackville-Baggins");
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Treasure Token")).toBe(3);
  });
});

describe("cost changes", () => {
  it("Tithe Taker: an opponent's ability costs {1} more during your turn only", () => {
    const { game } = table();
    spawn(game, "Tithe Taker");
    const rod = spawn(game, "Rod of Ruin", B);
    lands(game, "Wastes", 3, B);
    const offers = game.legalActions(B).filter((x) => x.kind === "activate-ability" && x.source === rod);
    expect(offers).toEqual([]);
    nextTurn(game);
    expect(game.legalActions(B).some((x) => x.kind === "activate-ability" && x.source === rod)).toBe(true);
  });

  it("Arm-Mounted Anchor: equip is free with one or fewer cards in hand", () => {
    const { game } = table();
    const anchor = spawn(game, "Arm-Mounted Anchor");
    const bear = spawn(game, "Grizzly Bears");
    expect(() => activate(game, anchor, 0, { targets: [ref(bear)] })).toThrow();
    for (const id of [...hand(game)].slice(1)) game.debugMove(id, "library");
    activate(game, anchor, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });

  it("Starport Security costs {2} less with a +1/+1 counter among your creatures", () => {
    const { game } = table();
    const security = spawn(game, "Starport Security");
    lands(game, "Plains", 2);
    const target = spawn(game, "Hill Giant", B);
    const bear = spawn(game, "Grizzly Bears");
    expect(() => activate(game, security, 0, { targets: [ref(target)] })).toThrow();
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bear)]);
    activate(game, security, 0, { targets: [ref(target)] });
    expect(game.state.objects[target].tapped).toBe(true);
  });

  it("Kasmina: an opponent's spell at your creature costs {2} more", () => {
    const { game } = table();
    spawn(game, "Kasmina, Enigmatic Mentor");
    const bear = spawn(game, "Grizzly Bears");
    nextTurn(game);
    lands(game, "Mountain", 2, B);
    expect(() => cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bear)] })).toThrow();
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("Rime Chill: {1} less for each colour among your permanents", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Goblin Guide");
    lands(game, "Island", 5);
    const target = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rime Chill"), { targets: [ref(target), null] });
    expect(counters(game, target, "stun")).toBe(1);
  });

  it("Plate Armor: equip {1} less for each other Equipment", () => {
    const { game } = table();
    const armor = spawn(game, "Plate Armor");
    spawn(game, "Arm-Mounted Anchor");
    lands(game, "Wastes", 2);
    const bear = spawn(game, "Grizzly Bears");
    activate(game, armor, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
  });

  it("Sentry Bot: cheaper and energy for each creature attacking you", () => {
    const { game, b } = table();
    nextTurn(game);
    const attackers = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    b.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: A }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Sentry Bot"));
    expect(game.state.players[A].energy ?? 0).toBe(2);
  });

  it("Blood for the Blood God! costs {1} less per creature that died and exiles itself", () => {
    const { game } = table();
    for (let i = 0; i < 8; i++) destroy(game, spawn(game, "Grizzly Bears", B));
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const spell = toHand(game, "Blood for the Blood God!");
    cast(game, spell);
    expect(life(game, B)).toBe(12);
    expect(zone(game, spell)).toBe("exile");
    expect(hand(game).length).toBe(8);
  });

  it("Death-Rattle Oni destroys the other damaged creatures", () => {
    const { game } = table();
    const hurt = spawn(game, "Hill Giant", B);
    const fine = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(hurt)], { source: spawn(game, "Shock") });
    enter(game, "Death-Rattle Oni");
    expect(zone(game, hurt)).toBe("graveyard");
    expect(zone(game, fine)).toBe("battlefield");
    expect(named(game, "Death-Rattle Oni").length).toBe(1);
  });
});

describe("Rooms", () => {
  it("Cramped Vents: 6 damage, life equal to the excess", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Cramped Vents // Access Maze"), face: 1, targets: [] });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });

  it("Access Maze: a spell from hand for life equal to its mana value, once each of your turns", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Cramped Vents // Access Maze"), face: 2, targets: [] });
    settle(game);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant, { altCost: true });
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game)).toBe(16);
    const second = toHand(game, "Hill Giant");
    expect(() => cast(game, second, { altCost: true })).toThrow();
  });
});

describe("granted statics", () => {



  it("Dancer's Chakrams: a Hero to carry it; your other commanders get +2/+2 and lifelink", () => {
    const { game } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].isCommander = true;
    enter(game, "Dancer's Chakrams");
    const [hero] = named(game, "Hero Token (Black Mage's Rod)");
    expect(pt(game, hero)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, commander)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, commander).has("lifelink")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });


});

describe("attacked this combat", () => {
  it("Kytheon transforms after attacking beside two others, not one", () => {
    const { game, a } = table();
    const kytheon = spawn(game, "Kytheon, Hero of Akros");
    const one = spawn(game, "Grizzly Bears");
    attack(game, a, [kytheon, one]);
    expect(faceName(game.state.objects[kytheon])).toBe("Kytheon, Hero of Akros");
    nextTurn(game);
    nextTurn(game);
    const two = spawn(game, "Hill Giant");
    attack(game, a, [kytheon, one, two]);
    const [gideon] = named(game, "Kytheon, Hero of Akros");
    expect(faceName(game.state.objects[gideon])).toBe("Gideon, Battle-Forged");
  });
});

describe("energy and graveyard play", () => {
  it("Blaster Hulk: paying eight energy deals 8 divided among its targets", () => {
    const { game, a } = table();
    const hulk = spawn(game, "Blaster Hulk");
    game.debugApplyEffect(A, { kind: "get-energy", amount: 6 });
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    a.chooseTargetsFn = () => [ref(giant), ref(B)];
    attack(game, a, [hulk]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBeLessThan(20 - 8 + 1);
  });

  it("Horde of Notions casts an Elemental from your graveyard for free", () => {
    const { game, a } = table();
    const horde = spawn(game, "Horde of Notions");
    for (const c of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, c, 1);
    const elemental = toGraveyard(game, "Air Elemental");
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: elemental, targets: [], via: "effect", free: true });
    activate(game, horde, 0, { targets: [ref(elemental)] });
    expect(zone(game, elemental)).toBe("battlefield");
  });
});

void graveyard;
