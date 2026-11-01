/**
 * Protection whose quality isn't a colour or a card type (rule 702.16a): each
 * read by all four of its parts — target (702.16b), enchant and equip (c, d),
 * damage (e), block (f). Players (702.16k: Cliffside Rescuer, Figure of Fable,
 * Absolute Virtue, True-Name Nemesis), everything (702.16j: Vexilus Praetor),
 * spells and permanents cast this turn (Emrakul twice, Devoted Caretaker),
 * subtypes (Baneslayer Angel, Riders of Gavony), the exiled card's card types
 * (Mirror Golem) and an instance that spares its Aura by card type (702.16n:
 * Tattoo Ward).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { protectionLabel } from "../effects.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { cardSource, isLegalTarget, permanentSource, protectionBlocks } from "../targeting.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  destroy,
  enter,
  graveyard,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
} from "./harness.js";

/** `source` deals 2 damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef): void => {
  game.debugApplyEffect(game.state.objects[source].owner, { kind: "damage", amount: 2, target: 0 }, [to], { source });
};
const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
/** Could `by`'s spell `name` (cast from a hand) target `to`? */
const spellCanTarget = (game: Game, by: PlayerId, name: string, to: TargetRef): boolean =>
  isLegalTarget(game.state, registryOf(game), "any-target", to, by, cardSource(registryOf(game).get(name), toHand(game, name, by)));
/** Could an ability of `from`, controlled by `by` (its controller if left out), target `to`? */
const abilityCanTarget = (game: Game, from: ObjectId, to: TargetRef, by: PlayerId = game.state.objects[from].controller): boolean =>
  isLegalTarget(game.state, registryOf(game), "any-target", to, by, permanentSource(game.state, registryOf(game), from));
const canBlock = (game: Game, seat: Parameters<typeof blockOffer>[1], attackers: readonly ObjectId[], blocker: ObjectId): readonly ObjectId[] =>
  blockOffer(game, seat, attackers).eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
const REANIMATE: EffectSpec = { kind: "put-onto-battlefield", target: 0, underYourControl: true };

describe("protection from players (rule 702.16k)", () => {
  it("Cliffside Rescuer: each of your opponents can't target, damage or block it; you can", () => {
    const { game, a } = table({ players: 3 });
    const rescuer = spawn(game, "Cliffside Rescuer");
    const bears = spawn(game, "Hill Giant");
    const other = spawn(game, "Hill Giant");
    activate(game, rescuer, 0, { targets: [ref(bears)] });
    expect(game.state.objects[rescuer].zone).toBe("graveyard");
    const goblinB = spawn(game, "Raging Goblin", B);
    const goblinC = spawn(game, "Raging Goblin", C);
    const mine = spawn(game, "Raging Goblin");
    // 702.16b, the player's spell and ability; not their own.
    expect(spellCanTarget(game, B, "Shock", ref(bears))).toBe(false);
    expect(spellCanTarget(game, C, "Shock", ref(bears))).toBe(false);
    expect(spellCanTarget(game, A, "Shock", ref(bears))).toBe(true);
    expect(abilityCanTarget(game, goblinB, ref(bears))).toBe(false);
    expect(abilityCanTarget(game, mine, ref(bears))).toBe(true);
    // The ability's controller, not its source's: the opponent's ability of a
    // permanent you've since taken is still theirs.
    expect(abilityCanTarget(game, mine, ref(bears), B)).toBe(false);
    expect(abilityCanTarget(game, goblinB, ref(bears), A)).toBe(true);
    // 702.16e.
    hit(game, goblinB, ref(bears));
    hit(game, goblinC, ref(bears));
    expect(marked(game, bears)).toBe(0);
    hit(game, mine, ref(bears));
    expect(marked(game, bears)).toBe(2);
    hit(game, goblinB, ref(other));
    expect(marked(game, other)).toBe(2);
    // 702.16f.
    expect(canBlock(game, a, [bears, other], goblinB)).toEqual([other]);
  });

  it("an Aura or Equipment they control falls off (702.16c, d); yours stays", () => {
    const { game } = table({ players: 2 });
    const rescuer = spawn(game, "Cliffside Rescuer");
    const bears = spawn(game, "Grizzly Bears");
    const theirAura = spawn(game, "Pacifism", B);
    const myAura = spawn(game, "Pacifism");
    const theirSword = spawn(game, "Bonesplitter", B);
    game.state.objects[theirAura].attachedTo = bears;
    game.state.objects[myAura].attachedTo = bears;
    game.state.objects[theirSword].attachedTo = bears;
    activate(game, rescuer, 0, { targets: [ref(bears)] });
    settle(game);
    expect(game.state.objects[theirAura].zone).toBe("graveyard");
    expect(game.state.objects[myAura].attachedTo).toBe(bears);
    expect(game.state.objects[theirSword].zone).toBe("battlefield");
    expect(game.state.objects[theirSword].attachedTo).toBeNull();
  });

  it("the players are fixed as it resolves: a new controller is still one of them (the ruling)", () => {
    const { game } = table({ players: 2 });
    const rescuer = spawn(game, "Cliffside Rescuer");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, rescuer, 0, { targets: [ref(bears)] });
    const theirs = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin");
    game.state.objects[bears].controller = B;
    hit(game, theirs, ref(bears));
    expect(marked(game, bears)).toBe(0);
    hit(game, mine, ref(bears));
    expect(marked(game, bears)).toBe(2);
  });

  it("an object with no controller is its owner's; a card someone else controls isn't (the ruling)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    lands(game, "Island", 3);
    cast(game, toHand(game, "True-Name Nemesis"));
    const [nemesis] = named(game, "True-Name Nemesis");
    expect(game.state.objects[nemesis].chosenPlayer).toBe(B);
    // A card of theirs in a graveyard.
    const card = toGraveyard(game, "Grizzly Bears", B);
    hit(game, card, ref(nemesis));
    expect(marked(game, nemesis)).toBe(0);
    // Theirs, controlled by someone else: not "not controlled by another".
    const stolen = spawn(game, "Grizzly Bears", B);
    game.state.objects[stolen].controller = C;
    game.debugApplyEffect(C, { kind: "damage", amount: 1, target: 0 }, [ref(nemesis)], { source: stolen });
    expect(marked(game, nemesis)).toBe(1);
    const carol = spawn(game, "Grizzly Bears", C);
    expect(spellCanTarget(game, B, "Shock", ref(nemesis))).toBe(false);
    expect(spellCanTarget(game, C, "Shock", ref(nemesis))).toBe(true);
    expect(abilityCanTarget(game, carol, ref(nemesis))).toBe(true);
  });

  it("a source that left is read as it last existed (rule 608.2h)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    lands(game, "Island", 3);
    cast(game, toHand(game, "True-Name Nemesis"));
    const [nemesis] = named(game, "True-Name Nemesis");
    game.state.objects[nemesis].counters["+1/+1"] = 3;
    // Theirs, dying with its "deals 1 damage to each creature".
    const bystander = spawn(game, "Hill Giant");
    const spitter = spawn(game, "Plague Spitter", B);
    destroy(game, spitter);
    settle(game);
    expect(graveyard(game, B)).toContain(spitter);
    expect(marked(game, bystander)).toBe(1);
    expect(marked(game, nemesis)).toBe(0);
  });

  it("Absolute Virtue: you have it, for as long as you control it", () => {
    const { game } = table({ players: 3 });
    const virtue = spawn(game, "Absolute Virtue");
    const goblinB = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin");
    expect(spellCanTarget(game, B, "Shock", ref(A))).toBe(false);
    expect(spellCanTarget(game, A, "Shock", ref(A))).toBe(true);
    expect(abilityCanTarget(game, goblinB, ref(A))).toBe(false);
    hit(game, goblinB, ref(A));
    expect(life(game, A)).toBe(20);
    hit(game, mine, ref(A));
    expect(life(game, A)).toBe(18);
    // Your creatures aren't protected, and an opponent is still in reach.
    expect(spellCanTarget(game, B, "Shock", ref(virtue))).toBe(true);
    expect(spellCanTarget(game, A, "Shock", ref(B))).toBe(true);
    destroy(game, virtue);
    settle(game);
    expect(spellCanTarget(game, B, "Shock", ref(A))).toBe(true);
  });

  it("Figure of Fable: a Soldier becomes an Avatar with it, for good", () => {
    const { game } = table({ players: 2 });
    const figure = spawn(game, "Figure of Fable");
    lands(game, "Plains", 10);
    activate(game, figure, 2);
    // Not a Soldier: nothing.
    expect(pt(game, figure)).toEqual({ power: 1, toughness: 1 });
    activate(game, figure, 0);
    activate(game, figure, 1);
    expect(subtypes(game, figure)).toEqual(["Kithkin", "Soldier"]);
    lands(game, "Plains", 6);
    activate(game, figure, 2);
    expect(subtypes(game, figure)).toEqual(["Kithkin", "Avatar"]);
    expect(pt(game, figure)).toEqual({ power: 7, toughness: 8 });
    expect(spellCanTarget(game, B, "Shock", ref(figure))).toBe(false);
    expect(spellCanTarget(game, A, "Shock", ref(figure))).toBe(true);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(figure));
    expect(marked(game, figure)).toBe(0);
    // The view names it, in words.
    expect(game.viewFor(A).objects[figure]?.text).toContain("Protection from each of your opponents");
  });
});

describe("protection from everything (rule 702.16j)", () => {
  it("Vexilus Praetor: your commanders, and nothing else, whoever's it is", () => {
    const { game, a } = table({ players: 2 });
    spawn(game, "Vexilus Praetor");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const other = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin");
    // Its controller's own, too.
    expect(spellCanTarget(game, A, "Shock", ref(commander))).toBe(false);
    expect(spellCanTarget(game, B, "Shock", ref(commander))).toBe(false);
    expect(abilityCanTarget(game, mine, ref(commander))).toBe(false);
    expect(spellCanTarget(game, B, "Shock", ref(other))).toBe(true);
    hit(game, mine, ref(commander));
    hit(game, goblin, ref(commander));
    expect(marked(game, commander)).toBe(0);
    expect(canBlock(game, a, [commander, other], goblin)).toEqual([other]);
  });

  it("no Aura or Equipment at all, nor a Role token with no object to ask about (702.16c, d)", () => {
    const { game } = table({ players: 2 });
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    const aura = spawn(game, "Pacifism");
    const sword = spawn(game, "Bonesplitter");
    game.state.objects[aura].attachedTo = commander;
    game.state.objects[sword].attachedTo = commander;
    const praetor = toHand(game, "Vexilus Praetor");
    lands(game, "Plains", 4);
    cast(game, praetor);
    settle(game);
    expect(game.state.objects[aura].zone).toBe("graveyard");
    expect(game.state.objects[sword].attachedTo).toBeNull();
    // A Role isn't made attached to it (`canCreateAttached`'s bare source).
    game.debugApplyEffect(A, { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 }, [ref(commander)]);
    expect(named(game, "Monster Role Token")).toEqual([]);
    const other = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 }, [ref(other)]);
    expect(named(game, "Monster Role Token")).toHaveLength(1);
  });
});

describe("protection from spells", () => {
  it("Emrakul, the Aeons Torn: a colored spell can't target it or damage it", () => {
    const { game } = table({ players: 2 });
    const emrakul = spawn(game, "Emrakul, the Aeons Torn");
    lands(game, "Mountain", 3);
    const shock = toHand(game, "Shock");
    expect(() => cast(game, shock, { targets: [ref(emrakul)] })).toThrow();
    // An untargeted red spell's damage is prevented, not the others'.
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pyroclasm"));
    expect(marked(game, emrakul)).toBe(0);
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("a colorless spell can target it (Scour from Existence)", () => {
    const { game } = table({ players: 2 });
    const emrakul = spawn(game, "Emrakul, the Aeons Torn");
    lands(game, "Wastes", 7);
    cast(game, toHand(game, "Scour from Existence"), { targets: [ref(emrakul)] });
    expect(game.state.objects[emrakul].zone).toBe("exile");
  });

  it("a colored permanent isn't a colored spell: it blocks, its ability targets, it damages (the ruling)", () => {
    const { game } = table({ players: 2 });
    const emrakul = spawn(game, "Emrakul, the Aeons Torn");
    const goblin = spawn(game, "Raging Goblin", B);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    expect(abilityCanTarget(game, sorcerer, ref(emrakul))).toBe(true);
    hit(game, goblin, ref(emrakul));
    expect(marked(game, emrakul)).toBe(2);
    expect(game.characteristics(emrakul).keywords.has("flying")).toBe(true);
    const flyer = spawn(game, "Serra Angel", B);
    expect(protectionBlocks(game.state, registryOf(game), emrakul, permanentSource(game.state, registryOf(game), flyer))).toBe(false);
  });

  it("a colored Aura can be put onto the battlefield enchanting it (the ruling), and stays", () => {
    const { game } = table({ players: 2 });
    const emrakul = spawn(game, "Emrakul, the Aeons Torn");
    const pacifism = game.debugSpawn("Pacifism", A, "graveyard");
    const source = game.debugSpawn("Island", A, "battlefield");
    game.debugApplyEffect(A, REANIMATE, [ref(pacifism)], { source });
    expect(game.state.awaiting).toMatchObject({ kind: "choose-enchant", options: [emrakul] });
    game.dispatch({ type: "choose-enchant", player: A, enchant: emrakul });
    settle(game);
    expect(game.state.objects[pacifism].attachedTo).toBe(emrakul);
    // Though no colored Aura spell can target it.
    expect(spellCanTarget(game, A, "Pacifism", ref(emrakul))).toBe(false);
  });

  it("its other parts: an extra turn as you cast it, annihilator, can't be countered, the shuffle", () => {
    const { game, a } = table({ players: 2 });
    lands(game, "Wastes", 15);
    cast(game, toHand(game, "Emrakul, the Aeons Torn"));
    const [emrakul] = named(game, "Emrakul, the Aeons Torn");
    expect(game.state.objects[emrakul].zone).toBe("battlefield");
    expect(game.state.extraTurns).toHaveLength(1);
    const def = registryOf(game).get("Emrakul, the Aeons Torn");
    expect(def.cantBeCountered).toBe(true);
    // Annihilator 6.
    game.state.objects[emrakul].summoningSick = false;
    const theirs = lands(game, "Island", 7, B);
    attack(game, a, [emrakul]);
    expect(theirs.filter((land) => game.state.objects[land].zone === "graveyard")).toHaveLength(6);
    // The whole graveyard, Emrakul in it, goes.
    toGraveyard(game, "Grizzly Bears");
    destroy(game, emrakul);
    settle(game);
    expect(graveyard(game, A)).toEqual([]);
  });

  it("Devoted Caretaker: instant and sorcery spells, and not an instant's permanent-source ability", () => {
    const { game } = table({ players: 2 });
    const caretaker = spawn(game, "Devoted Caretaker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    expect(spellCanTarget(game, B, "Shock", ref(bears))).toBe(true);
    activate(game, caretaker, 0, { targets: [ref(bears)] });
    expect(spellCanTarget(game, B, "Shock", ref(bears))).toBe(false);
    expect(spellCanTarget(game, A, "Shock", ref(bears))).toBe(false);
    expect(spellCanTarget(game, B, "Mind Rot", ref(bears))).toBe(false);
    // A creature spell with a target would be fine, and so is an ability.
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    expect(abilityCanTarget(game, sorcerer, ref(bears))).toBe(true);
    hit(game, sorcerer, ref(bears));
    expect(marked(game, bears)).toBe(2);
    expect(game.viewFor(A).objects[bears]?.text).toContain("Protection from instant spells and from sorcery spells until end of turn");
  });

  it("Emrakul, the World Anew: spells of any color, and permanents cast this turn, not others", () => {
    const { game } = table({ players: 2 });
    lands(game, "Wastes", 7);
    const emrakul = spawn(game, "Emrakul, the World Anew");
    expect(spellCanTarget(game, A, "Scour from Existence", ref(emrakul))).toBe(false);
    // A creature cast this turn, and one that wasn't.
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const [cast1] = named(game, "Grizzly Bears");
    const put = spawn(game, "Grizzly Bears");
    hit(game, cast1, ref(emrakul));
    expect(marked(game, emrakul)).toBe(0);
    hit(game, put, ref(emrakul));
    expect(marked(game, emrakul)).toBe(2);
    expect(abilityCanTarget(game, cast1, ref(emrakul))).toBe(false);
    expect(abilityCanTarget(game, put, ref(emrakul))).toBe(true);
  });

  it("Emrakul, the World Anew: you gain control of their creatures, for good, and sacrifice yours as it leaves", () => {
    const { game, a } = table({ players: 2 });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 12);
    pickTargets(a, B);
    cast(game, toHand(game, "Emrakul, the World Anew"));
    const [emrakul] = named(game, "Emrakul, the World Anew");
    expect(game.state.objects[bears].controller).toBe(A);
    destroy(game, emrakul);
    settle(game);
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });
});

describe("protection from a subtype (rule 702.16a)", () => {
  it("Baneslayer Angel: Demons and Dragons, as permanents and as spells, and not others", () => {
    const { game, a } = table({ players: 2 });
    const angel = spawn(game, "Baneslayer Angel");
    const dragon = spawn(game, "Shivan Dragon", B);
    const hellkite = spawn(game, "Serra Angel", B);
    hit(game, dragon, ref(angel));
    expect(marked(game, angel)).toBe(0);
    hit(game, hellkite, ref(angel));
    expect(marked(game, angel)).toBe(2);
    expect(abilityCanTarget(game, dragon, ref(angel))).toBe(false);
    expect(abilityCanTarget(game, hellkite, ref(angel))).toBe(true);
    expect(canBlock(game, a, [angel], hellkite)).toEqual([angel]);
    expect(canBlock(game, a, [angel], dragon)).toEqual([]);
  });

  it("Riders of Gavony: Humans you control, from creatures of the type chosen for it", () => {
    const { game, a } = table({ players: 2 });
    a.chooseCreatureTypeFn = () => "Goblin";
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Riders of Gavony"));
    const [riders] = named(game, "Riders of Gavony");
    expect(game.state.objects[riders].chosenCreatureType).toBe("Goblin");
    const human = spawn(game, "Isamaru, Hound of Konda");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, goblin, ref(riders));
    expect(marked(game, riders)).toBe(0);
    hit(game, bears, ref(riders));
    expect(marked(game, riders)).toBe(2);
    // Not a Human.
    hit(game, goblin, ref(human));
    expect(marked(game, human)).toBe(2);
    // Gone with it.
    destroy(game, riders);
    settle(game);
    expect(computeCharacteristics(game.state, registryOf(game), human).protectionFrom.boundFilters).toEqual([]);
  });

  it("reads a source that died as it last existed (rule 608.2h)", () => {
    const { game, a } = table({ players: 2 });
    a.chooseCreatureTypeFn = () => "Horror";
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Riders of Gavony"));
    const [riders] = named(game, "Riders of Gavony");
    const bystander = spawn(game, "Hill Giant");
    const spitter = spawn(game, "Plague Spitter", B);
    destroy(game, spitter);
    settle(game);
    expect(marked(game, bystander)).toBe(1);
    expect(marked(game, riders)).toBe(0);
  });
});

describe("protection from the exiled card's card types", () => {
  it("Mirror Golem: what the linked card is, while it stays exiled", () => {
    const { game, a } = table({ players: 2 });
    const card = toGraveyard(game, "Pacifism", B);
    pickTargets(a, card);
    pickModes(a, 0);
    const golem = enter(game, "Mirror Golem");
    expect(game.state.objects[card].zone).toBe("exile");
    const prot = computeCharacteristics(game.state, registryOf(game), golem).protectionFrom;
    expect([...prot.types]).toEqual(["enchantment"]);
    const aura = spawn(game, "Pacifism", B);
    const bears = spawn(game, "Grizzly Bears", B);
    hit(game, aura, ref(golem));
    expect(marked(game, golem)).toBe(0);
    hit(game, bears, ref(golem));
    expect(marked(game, golem)).toBe(2);
    expect(abilityCanTarget(game, aura, ref(golem))).toBe(false);
  });

  it("nothing while nothing's exiled", () => {
    const { game } = table({ players: 2 });
    const golem = spawn(game, "Mirror Golem");
    expect([...computeCharacteristics(game.state, registryOf(game), golem).protectionFrom.types]).toEqual([]);
  });
});

describe("an instance that spares its Aura, by card type (rule 702.16n)", () => {
  it("Tattoo Ward stays on; another Aura falls off", () => {
    const { game } = table({ players: 2 });
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Pacifism");
    game.state.objects[other].attachedTo = bears;
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Tattoo Ward"), { targets: [ref(bears)] });
    const [ward] = named(game, "Tattoo Ward");
    expect(game.state.objects[ward].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[other].zone).toBe("graveyard");
  });

  it("a second one's instance removes the first, and the first the second", () => {
    const { game } = table({ players: 2 });
    const bears = spawn(game, "Grizzly Bears");
    const first = spawn(game, "Tattoo Ward");
    const second = spawn(game, "Tattoo Ward");
    game.state.objects[first].attachedTo = bears;
    game.state.objects[second].attachedTo = bears;
    // Any spell resolving has state-based actions checked.
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(game.state.objects[first].zone).toBe("graveyard");
    expect(game.state.objects[second].zone).toBe("graveyard");
  });

  it("its sacrifice destroys an enchantment, and the protection stops an enchantment's ability", () => {
    const { game } = table({ players: 2 });
    const bears = spawn(game, "Grizzly Bears");
    const ward = spawn(game, "Tattoo Ward");
    game.state.objects[ward].attachedTo = bears;
    const enchantment = spawn(game, "Pacifism", B);
    expect(abilityCanTarget(game, enchantment, ref(bears))).toBe(false);
    const target = spawn(game, "Circle of Protection: Red", B);
    activate(game, ward, 0, { targets: [ref(target)] });
    expect(game.state.objects[target].zone).toBe("graveyard");
  });
});

describe("the words the client shows", () => {
  it("says what it is, not 'a quality'", () => {
    expect(protectionLabel({ filter: {} })).toBe("protection from everything");
    expect(protectionLabel({ fromPlayers: "opponents" })).toBe("protection from each of your opponents");
    expect(protectionLabel({ fromPlayers: [B] })).toBe("protection from each of your opponents");
    expect(protectionLabel({ filter: { subtype: "Zombie" } })).toBe("protection from Zombies");
    expect(protectionLabel({ filter: { colorless: true } })).toBe("protection from colorless");
    expect(protectionLabel({ colors: ["R"], types: ["artifact"] })).toBe("protection from red and from artifacts");
    expect(protectionLabel({ filter: { isSpell: true, colorless: false } })).toBe("protection from colored spells");
    expect(protectionLabel({ filter: { type: "creature", controllerIn: [B] } })).toBe("protection from creatures your opponents control");
    expect(protectionLabel({ filter: { anyOf: [{ isSpell: true, type: "instant" }, { isSpell: true, type: "sorcery" }] } })).toBe(
      "protection from instant spells and from sorcery spells",
    );
  });
});
