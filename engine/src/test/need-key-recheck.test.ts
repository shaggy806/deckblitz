/**
 * Cards whose triage named a need key the vocabulary already covered: the key's note had
 * gone stale, or a composition hadn't been tried (the 2026-11-02 pilot). Each is pinned on
 * real behaviour, so a key marked built on this evidence stays honest.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { LegalAction } from "../actions.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  grant,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
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
  types,
  zone,
} from "./harness.js";

const libraryOf = (game: Game, who = A): readonly ObjectId[] => game.state.zones.perPlayer[who].library;
const subtypesOf = (game: Game, id: ObjectId): readonly string[] => subtypes(game, id);

describe("search-library's exile destination (effect:search-library-to-exile)", () => {
  it("Selective Memory exiles any number of nonland cards", () => {
    const { game, a } = table();
    const land = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const spell = toLibrary(game, "Divination");
    lands(game, "Island", 4);
    const seen = pickFromZone(a, bears, spell);
    cast(game, toHand(game, "Selective Memory"));
    expect(seen.offered).not.toContain(land);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, spell)).toBe("exile");
    expect(zone(game, land)).toBe("library");
  });

  it("Foresight exiles three, and its controller draws at the next turn's upkeep", () => {
    const { game, a } = table();
    const cards = [toLibrary(game, "Forest"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Divination")];
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island");
    lands(game, "Island", 2);
    pickFromZone(a, ...cards);
    cast(game, toHand(game, "Foresight"));
    for (const card of cards) expect(zone(game, card)).toBe("exile");
    const before = hand(game).length;
    nextTurn(game, "draw");
    expect(activePlayerOf(game.state)).toBe(B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("shuffle-library's target (effect:shuffle-library)", () => {
  it("Lantern of Insight shuffles the target player's library, and is sacrificed to", () => {
    const { game } = table();
    for (let i = 0; i < 40; i += 1) toLibrary(game, i % 2 === 0 ? "Forest" : "Island", B);
    const order = [...libraryOf(game, B)];
    const lantern = spawn(game, "Lantern of Insight");
    activate(game, lantern, 0, { targets: [ref(B)] });
    expect(zone(game, lantern)).toBe("graveyard");
    expect(libraryOf(game, B)).not.toEqual(order);
    expect([...libraryOf(game, B)].sort()).toEqual([...order].sort());
  });

  it("Natural Selection reorders the target's top three, and may have them shuffle", () => {
    const { game, a } = table();
    for (let i = 0; i < 20; i += 1) toLibrary(game, "Island", B);
    const top = [toLibrary(game, "Forest", B), toLibrary(game, "Swamp", B), toLibrary(game, "Mountain", B)];
    const before = [...libraryOf(game, B)];
    lands(game, "Forest", 1);
    const seen = pickFromZone(a, ...top);
    pickModes(a);
    cast(game, toHand(game, "Natural Selection"), { targets: [ref(B)] });
    expect(seen.offered.length).toBe(3);
    expect(libraryOf(game, B).length).toBe(before.length);
    for (const card of top) expect(libraryOf(game, B)).toContain(card);
  });

  it("Natural Selection's shuffle, when you have them", () => {
    const { game, a } = table();
    for (let i = 0; i < 40; i += 1) toLibrary(game, i % 2 === 0 ? "Forest" : "Island", B);
    const order = [...libraryOf(game, B)];
    lands(game, "Forest", 1);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    pickModes(a, 0);
    cast(game, toHand(game, "Natural Selection"), { targets: [ref(B)] });
    expect(libraryOf(game, B)).not.toEqual(order);
  });
});

describe("delayed-trigger's whenever (effect:delayed-life-gain-trigger)", () => {
  it("Vizkopa Guildmage: each opponent loses what you gain, this turn only", () => {
    const { game } = table({ players: 4 });
    const mage = spawn(game, "Vizkopa Guildmage");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    activate(game, mage, 1);
    const bob = life(game, B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Angel's Mercy"));
    expect(life(game, B)).toBe(bob - 7);
    const turn = game.state.turn.number;
    while (game.state.turn.number < turn + 4) nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    const after = life(game, B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Angel's Mercy"));
    expect(life(game, B)).toBe(after);
  });
});

describe("for-each-player with look-and-choose (effect:target-player-exiles-from-graveyard)", () => {
  it("Merrow Bonegnawer: the target player chooses, from their own graveyard", () => {
    const { game, a, b } = table();
    const merrow = spawn(game, "Merrow Bonegnawer");
    const mine = toGraveyard(game, "Swamp", A);
    const one = toGraveyard(game, "Forest", B);
    const two = toGraveyard(game, "Island", B);
    a.chooseFromZoneFn = () => {
      throw new Error("the target player chooses, not the controller");
    };
    const seen = pickFromZone(b, one);
    activate(game, merrow, 0, { targets: [ref(B)] });
    expect(zone(game, one)).toBe("exile");
    expect(graveyard(game, B)).toEqual([two]);
    expect(seen.offered).not.toContain(mine);
  });
});

describe("search-library's linked exile (effect:search-to-linked-exile)", () => {
  it("Hoarding Dragon exiles an artifact, and its death may hand that card back", () => {
    const { game, a } = table();
    const relic = toLibrary(game, "Sol Ring");
    toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, relic);
    lands(game, "Mountain", 5);
    const dragon = toHand(game, "Hoarding Dragon");
    cast(game, dragon);
    expect(zone(game, relic)).toBe("exile");
    expect(hand(game)).not.toContain(relic);
    pickModes(a, 0);
    destroy(game, dragon);
    expect(zone(game, relic)).toBe("hand");
  });
});

describe("exile-graveyard's fromHand over every player (effect:exile-all-hands)", () => {
  it("Worldfire exiles the permanents, hands and graveyards, and everyone goes to 1", () => {
    const { game } = table({ players: 4 });
    const bears = spawn(game, "Grizzly Bears", B);
    const held = toHand(game, "Divination", C);
    const dead = toGraveyard(game, "Forest", D);
    lands(game, "Mountain", 9);
    cast(game, toHand(game, "Worldfire"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, held)).toBe("exile");
    expect(zone(game, dead)).toBe("exile");
    for (const p of [A, B, C, D]) expect(life(game, p)).toBe(1);
    expect(game.battlefield.length).toBe(0);
  });
});

describe("for-each-permanent over a target player's permanents (effect:token-copy-each-of-target-players)", () => {
  it("Clone Legion copies each creature that player controls, the tokens yours", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Serra Angel", B);
    spawn(game, "Goblin Piker", A);
    lands(game, "Island", 9);
    cast(game, toHand(game, "Clone Legion"), { targets: [ref(B)] });
    const mine = game.battlefield.filter((id) => game.state.objects[id].controller === A && types(game, id).includes("creature"));
    expect(mine.map((id) => pt(game, id).power).sort()).toEqual([2, 2, 4]);
  });
});

describe("the blocked filter clause (condition:blocked-creature-filter)", () => {
  it("Benalish Missionary targets only a blocked creature and stops its combat damage", () => {
    const { game, a, b } = table();
    const missionary = spawn(game, "Benalish Missionary");
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Goblin Piker");
    const blocker = spawn(game, "Serra Angel", B);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: B },
    ];
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    toStep(game, "declare-blockers");
    expect(() => activate(game, missionary, 0, { targets: [ref(other)] })).toThrow();
    activate(game, missionary, 0, { targets: [ref(bears)] });
    toStep(game, "postcombat-main");
    expect(game.state.objects[blocker].damageMarked).toBe(0);
    expect(life(game, B)).toBe(20 - pt(game, other).power);
  });
});

describe("hasAbilities in a static's scope (condition:no-abilities-filter)", () => {
  it("Muraganda Petroglyphs pumps a creature with no abilities, not one with any", () => {
    const { game } = table();
    const vanilla = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Muraganda Petroglyphs");
    expect(pt(game, vanilla)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    grant(game, vanilla, "flying");
    expect(pt(game, vanilla)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("return-exiled-by-source's filter (effect:return-linked-filter)", () => {
  it("Endless Sands returns only creature cards, after it's been sacrificed", () => {
    const { game } = table();
    const sands = spawn(game, "Endless Sands");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    activate(game, sands, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    game.state.objects[sands].tapped = false;
    activate(game, sands, 2);
    expect(zone(game, sands)).toBe("graveyard");
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears").length).toBe(1);
  });
});

describe("for-each-permanent with move-counters (effect:move-counters-from-all)", () => {
  it("Spike Cannibal takes every +1/+1 counter from every creature", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    game.state.objects[mine].counters["+1/+1"] = 2;
    game.state.objects[theirs].counters["+1/+1"] = 1;
    lands(game, "Swamp", 3);
    const cannibal = toHand(game, "Spike Cannibal");
    cast(game, cannibal);
    expect(counters(game, mine)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, cannibal)).toBe(4);
  });
});

describe("for-each-permanent with put-in-command-zone (effect:return-commanders-to-command-zone)", () => {
  it("Leadership Vacuum returns only that player's commanders, then you draw", () => {
    const { game } = table();
    const theirs = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel", A);
    game.state.objects[theirs].isCommander = true;
    game.state.objects[mine].isCommander = true;
    toLibrary(game, "Forest");
    const before = hand(game).length;
    lands(game, "Island", 3);
    cast(game, toHand(game, "Leadership Vacuum"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("command");
    expect(zone(game, mine)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("repeat around populate (effect:populate-x-times)", () => {
  it("Full Flowering populates X times", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Elf Warrior Token", count: 1 }, []);
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Full Flowering"), { x: 2 });
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(3);
  });
});

describe("damage-dealt-this-way per permanent (effect:restrict-dealt-damage-this-way)", () => {
  it("Aggravate: each creature dealt damage must attack, others needn't", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const theirs = spawn(game, "Goblin Piker", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Aggravate"), { targets: [ref(A)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[angel].damageMarked).toBe(1);
    expect(game.state.objects[theirs].damageMarked).toBe(0);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((o): o is Extract<LegalAction, { kind: "declare-attackers" }> => o.kind === "declare-attackers");
    expect([...(offer?.mustAttack ?? [])].sort()).toEqual([bears, angel].sort());
  });
});

describe("become-copy over a filter leaving out the source (effect:become-copy-filter-except-source)", () => {
  it("Deceiver of Form makes your other creatures copies, itself left out, until end of turn", () => {
    const { game, a } = table();
    const deceiver = spawn(game, "Deceiver of Form");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Goblin Piker", B);
    toLibrary(game, "Serra Angel");
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, deceiver).has("flying")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
    nextTurn(game);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("doubleTriggersOf with isSource in its filter (static:trigger-doubler-exclude-self)", () => {
  it("Twinflame Travelers doubles another Elemental's trigger, not a non-Elemental's", () => {
    const { game } = table();
    spawn(game, "Twinflame Travelers");
    spawn(game, "Soul Warden");
    const before = life(game);
    enter(game, "Grizzly Bears");
    expect(life(game)).toBe(before + 1);
  });

  it("Harmonic Prodigy doesn't double its own prowess, but a second one's", () => {
    const { game } = table();
    const one = spawn(game, "Harmonic Prodigy");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(pt(game, one).power).toBe(2);
    const two = spawn(game, "Harmonic Prodigy");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(pt(game, one).power).toBe(4);
    expect(pt(game, two).power).toBe(3);
  });
});

describe("isSource in a counters-put filter (trigger:counters-put-other)", () => {
  it("Enduring Scalelord sees another creature get counters, not itself", () => {
    const { game, a } = table();
    const lord = spawn(game, "Enduring Scalelord");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    expect(counters(game, lord)).toBe(1);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(lord)] });
    expect(counters(game, lord)).toBe(2);
  });

  it("Knight of Wundagore: only you putting one on another creature, once each turn", () => {
    const { game } = table();
    const knight = spawn(game, "Knight of Wundagore");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    expect(counters(game, knight)).toBe(1);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    expect(counters(game, knight)).toBe(1);
  });
});

describe("isSource in a turned-face-up filter (trigger:turned-face-up-other)", () => {
  it("Salt Road Ambushers puts two counters on another creature turned up", () => {
    const { game } = table();
    const salt = spawn(game, "Salt Road Ambushers");
    const faceDown = enter(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(faceDown)]);
    game.debugApplyEffect(A, { kind: "turn-face-up", target: 0 }, [ref(faceDown)]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(counters(game, faceDown)).toBe(2);
    expect(counters(game, salt)).toBe(0);
  });
});

describe("energy read as a player counter (effect:energy-count-amount)", () => {
  it("Greenbelt Rampager pays if it can, or goes back and gives {E}", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const first = toHand(game, "Greenbelt Rampager");
    cast(game, first);
    expect(zone(game, first)).toBe("hand");
    expect(game.state.players[A].energy).toBe(1);
    cast(game, first);
    expect(zone(game, first)).toBe("hand");
    expect(game.state.players[A].energy).toBe(2);
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("attack triggers reading their defender (condition:you-have-most-life-trigger-condition)", () => {
  it("Preacher of the Schism: a token for attacking the most life", () => {
    const { game, a } = table({ players: 3 });
    const preacher = spawn(game, "Preacher of the Schism");
    game.state.players[B].life = 10;
    game.state.players[C].life = 30;
    const before = life(game);
    attack(game, a, [preacher], C);
    expect(tokensNamed(game, "Lifelink Vampire Token", A)).toBe(1);
    expect(life(game)).toBe(before);
  });

  it("and a card for attacking while you have it", () => {
    const { game, a } = table({ players: 3 });
    const preacher = spawn(game, "Preacher of the Schism");
    game.state.players[B].life = 10;
    game.state.players[C].life = 15;
    toLibrary(game, "Forest");
    const before = hand(game).length;
    attack(game, a, [preacher], B);
    expect(tokensNamed(game, "Lifelink Vampire Token", A)).toBe(0);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });
});

describe("whileCondition on the attack (trigger:battalion)", () => {
  it("Frontline Medic gives indestructible with two others attacking, not one", () => {
    const { game, a } = table();
    const medic = spawn(game, "Frontline Medic");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Goblin Piker");
    a.declareAttackersFn = () => [medic, one, two].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(keywords(game, one).has("indestructible")).toBe(true);
  });

  it("and its counter names a spell with {X} in its cost", () => {
    const { game, a } = table();
    const medic = spawn(game, "Frontline Medic");
    lands(game, "Mountain", 2);
    const blaze = toHand(game, "Blaze");
    cast(game, blaze, { x: 1, targets: [ref(B)], settle: false });
    pickModes(a);
    const before = life(game, B);
    activate(game, medic, 0, { targets: [ref(blaze)] });
    expect(zone(game, medic)).toBe("graveyard");
    expect(zone(game, blaze)).toBe("graveyard");
    expect(life(game, B)).toBe(before);
  });
});

describe("damage-all's controlledByTarget on a planeswalker (effect:damage-all-controller-of-target)", () => {
  it("Chandra, Pyrogenius's −10 at a planeswalker hits its controller's creatures", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Pyrogenius");
    game.state.objects[chandra].counters.loyalty = 10;
    const walker = spawn(game, "Liliana of the Veil", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Serra Angel", A);
    loyalty(game, chandra, -10, { targets: [ref(walker)] });
    expect(zone(game, walker)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("and at a player", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Pyrogenius");
    game.state.objects[chandra].counters.loyalty = 10;
    const bears = spawn(game, "Grizzly Bears", B);
    const before = life(game, B);
    loyalty(game, chandra, -10, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 6);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("the \"attached\" ref on add-counter (effect:add-counter-equipped-creature)", () => {
  it("Ghost Lantern's counter goes on the equipped creature", () => {
    const { game } = table();
    const lantern = spawn(game, "Ghost Lantern");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Goblin Piker");
    lands(game, "Swamp", 1);
    activate(game, lantern, 0, { targets: [ref(bears)] });
    destroy(game, other);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("cardsInHand's target (amount:cards-in-target-player-hand)", () => {
  it("Rousing Refrain adds {R} per card in that opponent's hand, and suspends itself", () => {
    const { game } = table();
    toHand(game, "Forest", B);
    lands(game, "Mountain", 5);
    const refrain = toHand(game, "Rousing Refrain");
    cast(game, refrain, { targets: [ref(B)] });
    expect(game.state.players[A].manaPool.filter((m) => m.type === "R").length).toBe(hand(game, B).length);
    expect(zone(game, refrain)).toBe("exile");
    expect(counters(game, refrain, "time")).toBe(3);
  });
});

describe("as-player for an amount about another player (amount:cards-in-hand-of-target-controller)", () => {
  it("Flunk reads that creature's controller's hand", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    game.state.zones.perPlayer[B].hand.splice(5);
    for (let i = hand(game, B).length; i < 5; i += 1) toHand(game, "Forest", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Flunk"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("as-player around exile-graveyard (effect:exile-graveyard-of-trigger-object-controller)", () => {
  it("Burn Away exiles the dead creature's controller's graveyard", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const theirs = toGraveyard(game, "Forest", B);
    const mine = toGraveyard(game, "Island", A);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Burn Away"), { targets: [ref(angel)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("of-player in a trigger condition (trigger:attack-trigger-defender-controls-count)", () => {
  it("Owlbear Cub looks only when the attacked player has eight lands", () => {
    const { game, a } = table({ players: 3 });
    const cub = spawn(game, "Owlbear Cub");
    lands(game, "Forest", 8, B);
    const angel = toLibrary(game, "Serra Angel");
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Forest");
    pickFromZone(a, angel);
    a.declareAttackersFn = () => [{ attacker: cub, defender: B }];
    toStep(game, "declare-blockers");
    expect(zone(game, angel)).toBe("battlefield");
    expect(game.state.objects[angel].tapped).toBe(true);
  });

  it("and not for a player with seven", () => {
    const { game, a } = table({ players: 3 });
    const cub = spawn(game, "Owlbear Cub");
    lands(game, "Forest", 7, B);
    lands(game, "Forest", 8, C);
    const angel = toLibrary(game, "Serra Angel");
    attack(game, a, [cub], B);
    expect(zone(game, angel)).toBe("library");
  });
});

describe("search-library's exile, then cast-now (effect:search-to-exile-then-cast)", () => {
  it("Bring to Light finds up to its converge, and may cast it free", () => {
    const { game, a } = table();
    const low = toLibrary(game, "Grizzly Bears");
    const high = toLibrary(game, "Divination");
    lands(game, "Forest", 4);
    lands(game, "Island", 1);
    const seen = pickFromZone(a, low);
    a.chooseCastNowFn = (_view, offer) => ({ type: "cast-spell", player: A, card: offer.casts[0].card, targets: [], via: "effect", free: true });
    cast(game, toHand(game, "Bring to Light"));
    expect(seen.offered).not.toContain(high);
    expect(zone(game, low)).toBe("battlefield");
  });
});

describe("a combat restriction scoped by power (filter:static-affects-by-power, static:pt-filtered-static)", () => {
  it("Meekstone keeps power 3 or greater tapped, reading P/T as it is now", () => {
    const { game } = table();
    spawn(game, "Meekstone");
    const big = spawn(game, "Serra Angel", A, { tapped: true });
    const small = spawn(game, "Grizzly Bears", A, { tapped: true });
    const grown = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.state.objects[grown].counters["+1/+1"] = 1;
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[big].tapped).toBe(true);
    expect(game.state.objects[grown].tapped).toBe(true);
    expect(game.state.objects[small].tapped).toBe(false);
  });
});

describe("ofChosenColor in a prohibits filter (effect:prohibit-cast-chosen-color)", () => {
  it("Iona stops opponents casting the chosen color, and only that", () => {
    const { game } = table();
    const iona = spawn(game, "Iona, Shield of Emeria");
    game.state.objects[iona].chosenOnEnter = "U";
    toStep(game, "precombat-main", B);
    lands(game, "Island", 3, B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Divination", B), { player: B })).toThrow();
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(life(game)).toBe(18);
  });
});

describe("host-now with of-player, for attacking alone (condition:attacking-alone-condition)", () => {
  it("Security Bypass: can't be blocked alone, can with company", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Security Bypass"), { targets: [ref(bears)] });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const alone = game.legalActions(B).find((o): o is Extract<LegalAction, { kind: "declare-blockers" }> => o.kind === "declare-blockers");
    expect(alone?.eligible.find((e) => e.blocker === blocker)?.canBlock ?? []).not.toContain(bears);
  });

  it("and can be blocked with company", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Goblin Piker");
    const blocker = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Security Bypass"), { targets: [ref(bears)] });
    a.declareAttackersFn = () => [bears, other].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const paired = game.legalActions(B).find((o): o is Extract<LegalAction, { kind: "declare-blockers" }> => o.kind === "declare-blockers");
    expect(paired?.eligible.find((e) => e.blocker === blocker)?.canBlock).toContain(bears);
  });
});

describe("of-player with not your-turn, a caster's turn (condition:trigger-condition-casters-turn)", () => {
  it("March of the World Ooze: a token when an opponent casts off their turn, not on it", () => {
    const { game } = table({ players: 3 });
    const march = spawn(game, "March of the World Ooze");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(subtypes(game, bears)).toContain("Ooze");
    expect(zone(game, march)).toBe("battlefield");
    lands(game, "Mountain", 2, B);
    // "Their" is the caster (an intervening if, rule 603.4). Bob casts in
    // alice's main phase: not his turn, an Elephant.
    const first = toHand(game, "Shock", B);
    game.advanceUntil((s) => s.priority.holder === B && s.zones.shared.stack.length === 0 && s.turn.step === "precombat-main");
    expect(activePlayerOf(game.state)).toBe(A);
    cast(game, first, { player: B, targets: [ref(A)] });
    expect(tokensNamed(game, "Elephant Token", A)).toBe(1);
    // In his own turn: none.
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(tokensNamed(game, "Elephant Token", A)).toBe(1);
  });
});

describe("sharesCreatureTypeWith the source (condition:filter-shares-creature-type-with-source)", () => {
  it("Folk Hero's commander draws for a spell sharing its type, once each turn", () => {
    const { game } = table();
    spawn(game, "Folk Hero");
    const commander = spawn(game, "Goblin Piker");
    game.state.objects[commander].isCommander = true;
    toLibrary(game, "Forest");
    toLibrary(game, "Forest");
    const before = hand(game).length;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Goblin Piker"));
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Goblin Piker"));
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("for-each-player's whoIf (effect:scope-opponents-who-lost-life-this-turn)", () => {
  it("Papalymo Totolymo: only an opponent who lost life sacrifices their biggest", () => {
    const { game } = table({ players: 3 });
    const papalymo = spawn(game, "Papalymo Totolymo");
    const small = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Serra Angel", B);
    const untouched = spawn(game, "Serra Angel", C);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, target: 0 }, [ref(B)]);
    lands(game, "Plains", 4);
    activate(game, papalymo, 0);
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, small)).toBe("battlefield");
    expect(zone(game, untouched)).toBe("battlefield");
  });
});

describe("choose-permanents then damage-rule (effect:prevent-combat-damage-by-chosen-creature)", () => {
  it("Ajani's Aid stops a creature chosen on resolution, untargeted", () => {
    const { game, a } = table();
    const aid = spawn(game, "Ajani's Aid");
    const hexproof = spawn(game, "Gladecover Scout", A);
    a.choosePermanentsFn = () => [hexproof];
    activate(game, aid, 0);
    expect(zone(game, aid)).toBe("graveyard");
    attack(game, a, [hexproof]);
    expect(life(game, B)).toBe(20);
  });
});

describe("as-player around damage-rule (effect:prevent-combat-damage-by-target-players-creatures)", () => {
  it("Encircling Fissure stops that opponent's creatures, not another's", () => {
    const { game, a, b } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Encircling Fissure"), { targets: [ref(B)] });
    b.declareBlockersFn = () => [{ blocker, attacker: mine }];
    attack(game, a, [mine]);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[blocker].damageMarked).toBe(2);
  });
});

describe("as-player around prohibit, read after the counter (effect:prohibit-controller-of-target)", () => {
  it("Render Silent silences the countered spell's controller", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    lands(game, "Plains", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Render Silent"), { targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(B)] })).toThrow();
  });
});

describe("discard-chosen's library, then a shuffle (effect:chosen-hand-card-shuffle-into-library)", () => {
  it("Perish the Thought puts the chosen card into their library", () => {
    const { game, a } = table();
    const card = toHand(game, "Divination", B);
    for (let i = 0; i < 20; i += 1) toLibrary(game, "Forest", B);
    a.chooseFromZoneFn = () => [card];
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Perish the Thought"), { targets: [ref(B)] });
    expect(zone(game, card)).toBe("library");
    expect(libraryOf(game, B)).toContain(card);
  });
});

describe("search-library's together (effect:search-different-names)", () => {
  it("Shared Summons: two creatures, different names", () => {
    const { game, a } = table();
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Grizzly Bears");
    const three = toLibrary(game, "Serra Angel");
    a.chooseFromZoneFn = () => [one, three];
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Shared Summons"));
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, three)).toBe("hand");
    expect(zone(game, two)).toBe("library");
  });
});

describe("isSource in a graveyard choice (filter:graveyard-choice-other-than-source)", () => {
  it("Ichorid comes back for another black creature card, never itself", () => {
    const { game, a } = table();
    const ichorid = toGraveyard(game, "Ichorid");
    const other = toGraveyard(game, "Foul Imp");
    pickModes(a, 0);
    const seen = pickFromZone(a, other);
    nextTurn(game);
    nextTurn(game);
    expect(seen.offered).not.toContain(ichorid);
    expect(zone(game, other)).toBe("exile");
    expect(zone(game, ichorid)).toBe("battlefield");
  });

  it("and stays, with nothing else to exile", () => {
    const { game, a } = table();
    const ichorid = toGraveyard(game, "Ichorid");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, ichorid)).toBe("graveyard");
  });
});

describe("no maximum hand size beyond the permanent's own controller", () => {
  // The harness's table plays with a limit of 99, which nothing would reach.
  const sevenCardLimit = (game: Game): void => {
    for (const p of game.state.turnOrder) game.state.players[p].maxHandSize = 7;
  };
  const handOf = (game: Game, n: number, who = A): void => {
    for (let i = hand(game, who).length; i < n; i += 1) toHand(game, "Forest", who);
  };

  it("Praetor's Counsel: for the rest of the game, itself exiled", () => {
    const { game } = table();
    sevenCardLimit(game);
    const old = toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 8);
    const counsel = toHand(game, "Praetor's Counsel");
    cast(game, counsel);
    expect(zone(game, old)).toBe("hand");
    expect(zone(game, counsel)).toBe("exile");
    handOf(game, 12);
    const turn = game.state.turn.number;
    while (game.state.turn.number < turn + 3) nextTurn(game);
    expect(hand(game).length).toBeGreaterThanOrEqual(12);
  });

  it("Folio of Fancies: every player, and it needs its permanent", () => {
    const { game } = table();
    sevenCardLimit(game);
    const folio = spawn(game, "Folio of Fancies");
    handOf(game, 12);
    nextTurn(game);
    expect(hand(game).length).toBeGreaterThanOrEqual(12);
    handOf(game, 12, B);
    nextTurn(game);
    expect(hand(game, B).length).toBeGreaterThanOrEqual(12);
    destroy(game, folio);
    handOf(game, 12);
    nextTurn(game);
    expect(hand(game).length).toBe(7);
  });

  it("Enter the Infinite: only until your next turn", () => {
    const { game } = table();
    sevenCardLimit(game);
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Forest");
    lands(game, "Island", 12);
    const left = libraryOf(game).length;
    cast(game, toHand(game, "Enter the Infinite"));
    expect(libraryOf(game).length).toBe(1);
    expect(left).toBeGreaterThan(1);
    handOf(game, 12);
    nextTurn(game);
    expect(hand(game).length).toBeGreaterThanOrEqual(12);
    nextTurn(game);
    handOf(game, 12);
    nextTurn(game);
    expect(hand(game).length).toBe(7);
  });

  it("Nerd Rage: the enchanted creature's controller's, not the Aura's", () => {
    const { game } = table();
    sevenCardLimit(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    for (let i = 0; i < 2; i += 1) toLibrary(game, "Forest");
    cast(game, toHand(game, "Nerd Rage"), { targets: [ref(theirs)] });
    handOf(game, 12);
    nextTurn(game);
    expect(hand(game).length).toBe(7);
    handOf(game, 12, B);
    nextTurn(game);
    expect(hand(game, B).length).toBeGreaterThanOrEqual(12);
  });
});

describe("choose-permanents at random (effect:random-permanent)", () => {
  it("Cinderheart Giant hits one opposing creature, asking nobody", () => {
    const { game, a } = table();
    const giant = spawn(game, "Cinderheart Giant");
    const one = spawn(game, "Serra Angel", B);
    const two = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel", A);
    a.choosePermanentsFn = () => {
      throw new Error("nobody chooses");
    };
    destroy(game, giant);
    settle(game);
    expect([one, two].filter((id) => zone(game, id) === "graveyard").length).toBe(1);
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("and does nothing with none to hit", () => {
    const { game } = table();
    const giant = spawn(game, "Cinderheart Giant");
    const mine = spawn(game, "Serra Angel", A);
    destroy(game, giant);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("of-player over some opponent (condition:opponent-hand-size)", () => {
  it("Guul Draz Specter gets +3/+3 with any one opponent's hand empty", () => {
    const { game } = table({ players: 3 });
    const specter = spawn(game, "Guul Draz Specter");
    game.state.zones.perPlayer[A].hand.length = 0;
    toHand(game, "Forest", B);
    toHand(game, "Forest", C);
    expect(pt(game, specter).power).toBe(2);
    game.state.zones.perPlayer[C].hand.length = 0;
    expect(pt(game, specter).power).toBe(5);
  });

  it("not with your own hand empty", () => {
    const { game } = table();
    const specter = spawn(game, "Guul Draz Specter");
    game.state.zones.perPlayer[A].hand.length = 0;
    toHand(game, "Forest", B);
    expect(pt(game, specter).power).toBe(2);
  });

  it("Avatar of Will costs {6} less for it, in a cost reduction", () => {
    const { game } = table();
    lands(game, "Island", 2);
    game.state.zones.perPlayer[B].hand.length = 0;
    const avatar = toHand(game, "Avatar of Will");
    cast(game, avatar);
    expect(zone(game, avatar)).toBe("battlefield");
  });
});

describe("hasAbilities on your side only (condition:no-abilities-filter)", () => {
  it("Ruxa pumps your creatures with no abilities and returns such a card", () => {
    const { game } = table();
    const vanilla = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const dead = toGraveyard(game, "Grizzly Bears");
    const skilled = toGraveyard(game, "Serra Angel");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Ruxa, Patient Professor"));
    expect(pt(game, vanilla).power).toBe(3);
    expect(pt(game, theirs).power).toBe(2);
    expect(zone(game, dead)).toBe("hand");
    expect(zone(game, skilled)).toBe("graveyard");
  });
});

describe("a restriction scoped by P/T, on a creature (static:pt-filtered-static)", () => {
  it("Marble Titan holds itself too, a 3/3", () => {
    const { game } = table();
    const titan = spawn(game, "Marble Titan", A, { tapped: true });
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[titan].tapped).toBe(true);
  });
});

describe("a keyword-scoped restriction (Stormtide Leviathan)", () => {
  it("creatures without flying or islandwalk can't attack, and every land's an Island", () => {
    const { game } = table();
    spawn(game, "Stormtide Leviathan");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const forest = lands(game, "Forest", 1)[0];
    expect(subtypesOf(game, forest)).toContain("Island");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((o): o is Extract<LegalAction, { kind: "declare-attackers" }> => o.kind === "declare-attackers");
    const can = Object.keys(offer?.defendersFor ?? {});
    expect(can).toContain(angel);
    expect(can).not.toContain(bears);
  });
});

describe("not plus anyOf (condition:cant-be-blocked-except-by-flying-or-reach)", () => {
  it("Signal Pest: blocked only by flying or reach", () => {
    const { game, a } = table();
    const pest = spawn(game, "Signal Pest");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const spider = spawn(game, "Giant Spider", B);
    a.declareAttackersFn = () => [{ attacker: pest, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game
      .legalActions(B)
      .find((o): o is Extract<LegalAction, { kind: "declare-blockers" }> => o.kind === "declare-blockers");
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer?.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(bears)).not.toContain(pest);
    expect(canBlock(angel)).toContain(pest);
    expect(canBlock(spider)).toContain(pest);
  });
});
