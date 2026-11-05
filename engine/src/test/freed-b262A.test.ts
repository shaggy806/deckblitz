/**
 * Batch 262, group A: cards freed by the need-keys families (other players'
 * choices, cast and activate restrictions, reveal-until counts, skipped turns,
 * token copies by an amount, graveyard order and more). One test for the
 * clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import { activePlayerOf } from "../state.js";
import {
  A,
  activate,
  attack,
  B,
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
  pickFromZone,
  pickModes,
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

describe("spells and abilities that cost less, and restrictions", () => {
  it("Peerless Samurai: attacking alone makes the next spell cost {1} less", () => {
    const { game, a } = table();
    const samurai = spawn(game, "Peerless Samurai");
    attack(game, a, [samurai]);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears", A).some((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("Clergy of the Holy Nimbus: only an opponent may stop its regeneration", () => {
    const { game } = table();
    const clergy = spawn(game, "Clergy of the Holy Nimbus");
    lands(game, "Wastes", 1);
    expect(() => activate(game, clergy, 0)).toThrow();
    destroy(game, clergy);
    expect(zone(game, clergy)).toBe("battlefield");
    nextTurn(game);
    lands(game, "Wastes", 1, B);
    activate(game, clergy, 0, { player: B });
    destroy(game, clergy);
    expect(zone(game, clergy)).toBe("graveyard");
  });

  it("Armageddon Clock: its counter comes off only during an upkeep, and the draw step deals the count", () => {
    const { game } = table();
    const clock = spawn(game, "Armageddon Clock");
    game.state.objects[clock].counters.doom = 1;
    lands(game, "Wastes", 4);
    expect(() => activate(game, clock, 0)).toThrow();
    toStep(game, "draw");
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });

  it("Zenith Chronicler: only the first multicolored spell each turn makes the others draw", () => {
    const { game } = table();
    spawn(game, "Zenith Chronicler");
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before.b);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before.b + 1);
    expect(hand(game, A).length).toBe(before.a);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before.b + 1);
  });

  it("Compelling Deterrence: the owner discards only if you control a Zombie", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const before = hand(game, B).length;
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Compelling Deterrence"), { targets: [ref(bear)] });
    expect(hand(game, B).length).toBe(before + 1);
    spawn(game, "Walking Corpse");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Compelling Deterrence"), { targets: [ref(giant)] });
    expect(zone(game, giant)).not.toBe("battlefield");
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("Phyrexian Censor: one non-Phyrexian spell a turn, a Phyrexian one free of it; non-Phyrexians enter tapped", () => {
    const { game } = table();
    spawn(game, "Phyrexian Censor");
    lands(game, "Forest", 4);
    lands(game, "Swamp", 4);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    const rager = toHand(game, "Phyrexian Rager");
    cast(game, rager);
    expect(zone(game, rager)).toBe("battlefield");
    expect(game.state.objects[rager].tapped).toBe(false);
  });

  it("Limited Resources: each player keeps five lands, and ten lands stop land plays", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    lands(game, "Wastes", 7, B);
    enter(game, "Limited Resources");
    const landsOf = (p: typeof A) =>
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === p && game.state.objects[id].cardName !== "Limited Resources").length;
    expect(landsOf(A)).toBe(5);
    expect(landsOf(B)).toBe(5);
    const land = toHand(game, "Plains");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === land)).toBe(false);
    game.debugMove(game.state.zones.shared.battlefield.find((id) => game.state.objects[id].controller === B)!, "graveyard");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === land)).toBe(true);
  });

  it("Moonhold: red mana stops land plays, and creature spells stay castable without white", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Moonhold"), { targets: [ref(A)] });
    const land = toHand(game, "Forest");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === land)).toBe(false);
    lands(game, "Forest", 2);
    const bear = toHand(game, "Grizzly Bears");
    cast(game, bear);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Hand to Hand: no instants during combat, but after it", () => {
    const { game } = table();
    spawn(game, "Hand to Hand");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    toStep(game, "begin-combat");
    expect(() => cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] })).toThrow();
    toStep(game, "postcombat-main");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] });
    expect(pt(game, bear).power).toBe(5);
  });

  it("Innocuous Researcher: untapping its lands at end step bars spells until its next turn", () => {
    const { game, a } = table();
    spawn(game, "Innocuous Researcher");
    const forests = lands(game, "Forest", 2, A);
    for (const id of forests) game.state.objects[id].tapped = true;
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(forests.every((id) => game.state.objects[id].tapped === false)).toBe(true);
    const bear = spawn(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] })).toThrow();
  });

  it("Bound in Gold: the enchanted creature's mana ability still works, its others don't", () => {
    const { game } = table();
    const piker = spawn(game, "Prodigal Sorcerer");
    const elf = spawn(game, "Llanowar Elves");
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Bound in Gold"), { targets: [ref(piker)] });
    cast(game, toHand(game, "Bound in Gold"), { targets: [ref(elf)] });
    expect(() => activate(game, piker, 0, { targets: [ref(B)] })).toThrow();
    activate(game, elf, 0);
    expect(game.state.objects[elf].tapped).toBe(true);
  });
});

describe("skipped turns", () => {
  it("Chronatog Totem: the {0} pump only while it's a creature, and its controller skips a turn", () => {
    const { game } = table();
    const totem = spawn(game, "Chronatog Totem");
    expect(() => activate(game, totem, 2)).toThrow();
    lands(game, "Island", 2);
    activate(game, totem, 1);
    activate(game, totem, 2);
    expect(pt(game, totem)).toEqual({ power: 4, toughness: 5 });
    expect(() => activate(game, totem, 2)).toThrow();
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("Lethal Vapors: an opponent may destroy it, and that opponent skips their next turn", () => {
    const { game } = table();
    const vapors = spawn(game, "Lethal Vapors");
    const bear = enter(game, "Grizzly Bears", B);
    expect(zone(game, bear)).toBe("graveyard");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    activate(game, vapors, 0, { player: B });
    expect(zone(game, vapors)).toBe("graveyard");
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
  });

  it("Waterspout Elemental: kicked, every other creature is bounced", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Island", 6);
    const spout = toHand(game, "Waterspout Elemental");
    cast(game, spout, { kicked: true });
    expect(zone(game, spout)).toBe("battlefield");
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, mine)).toBe("hand");
  });

  it("Chronosavant: returns from the graveyard tapped", () => {
    const { game } = table();
    const savant = toGraveyard(game, "Chronosavant");
    lands(game, "Plains", 2);
    activate(game, savant, 0);
    expect(zone(game, savant)).toBe("battlefield");
    expect(game.state.objects[savant].tapped).toBe(true);
  });
});

describe("reveals, searches and other players' choices", () => {
  it("Burning-Rune Demon: the opponent's pick goes to hand, the other to the graveyard", () => {
    const { game, a, b } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bear = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, bolt, bear);
    pickFromZone(b, bear);
    enter(game, "Burning-Rune Demon");
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("Ecological Appreciation: two of the finds go back, the rest enter", () => {
    const { game, a, b } = table();
    const bear = toLibrary(game, "Grizzly Bears");
    const corpse = toGraveyard(game, "Walking Corpse");
    const elves = toLibrary(game, "Llanowar Elves");
    toLibrary(game, "Hill Giant");
    const search = pickFromZone(a, bear, corpse, elves);
    pickFromZone(b, bear, elves);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Ecological Appreciation"), { x: 2 });
    // Mana value 2 or less only: the Hill Giant isn't offered.
    expect(search.offered.some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(false);
    expect(zone(game, corpse)).toBe("battlefield");
    expect(zone(game, bear)).toBe("library");
    expect(zone(game, elves)).toBe("library");
  });

  it("Mind Funeral: everything revealed until the fourth land goes to the graveyard", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Hill Giant", B);
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Mind Funeral"), { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 6);
  });

  it("Mirko Vosk: the player it hits mills until four lands", () => {
    const { game, a } = table();
    const mirko = spawn(game, "Mirko Vosk, Mind Drinker");
    toLibrary(game, "Grizzly Bears", B);
    const before = graveyard(game, B).length;
    attack(game, a, [mirko]);
    expect(graveyard(game, B).length).toBe(before + 5);
  });

  it("Recross the Paths: the land found enters, the cards above it go to the bottom", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    const forest = toLibrary(game, "Forest");
    const bear = toLibrary(game, "Hill Giant");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Recross the Paths"));
    expect(zone(game, forest)).toBe("battlefield");
    const library = game.state.zones.perPlayer[A].library;
    // Index 0 is the top: the Giant went under (the clash may bottom one more).
    expect(library.indexOf(bear)).toBeGreaterThanOrEqual(library.length - 2);
  });

  it("Barrow Ghoul: sacrificed with no creature card to exile, kept by exiling the top one", () => {
    const { game, a } = table();
    const ghoul = spawn(game, "Barrow Ghoul");
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, ghoul)).toBe("graveyard");
    const second = spawn(game, "Barrow Ghoul");
    const older = toGraveyard(game, "Grizzly Bears");
    const top = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    pickModes(a, 0);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, second)).toBe("battlefield");
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, older)).toBe("graveyard");
  });

  it("Augusta: each player exiles a card, and the nonland ones put counters on an attacker", () => {
    const { game, a } = table();
    const augusta = spawn(game, "Augusta, Order Returned");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Island", B);
    attack(game, a, [augusta]);
    expect(counters(game, augusta)).toBe(1);
  });

  it("Wildfire Devils: the random player's instant or sorcery is copied and cast", () => {
    const { game, a } = table();
    toGraveyard(game, "Divination");
    toGraveyard(game, "Divination", B);
    a.chooseCastNowFn = (_v, offer) =>
      offer.cards.length === 0 ? null : { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    const before = hand(game, A).length;
    enter(game, "Wildfire Devils");
    expect(hand(game, A).length).toBe(before + 2);
    expect(graveyard(game, A).length + graveyard(game, B).length).toBe(1);
  });

  it("Audacious Swap: the owner exiles from their own library and puts a land onto the battlefield", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    const before = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B).length;
    cast(game, toHand(game, "Audacious Swap"), { targets: [ref(bear)] });
    expect(zone(game, bear)).not.toBe("battlefield");
    const exiledOrLand =
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B).length === before ||
      game.state.zones.shared.exile.some((id) => game.state.objects[id].owner === B);
    expect(exiledOrLand).toBe(true);
  });

  it("Invasion of the Giants: revealing a Giant deals 2, and the next Giant spell costs {2} less", () => {
    const { game, a } = table();
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    const saga = spawn(game, "Invasion of the Giants");
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    expect(life(game, B)).toBe(18);
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "lore", amount: 1 }, [], { source: saga });
    settle(game);
    lands(game, "Mountain", 2);
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Invasion of Tarkir: X plus 2 damage, X the Dragons revealed", () => {
    const { game, a } = table();
    const dragon = toHand(game, "Shivan Dragon");
    pickFromZone(a, dragon);
    a.chooseTargetsFn = (_v, _s, _specs, options) => [options[0].find((o) => o.kind === "player" && o.player === B) ?? null];
    enter(game, "Invasion of Tarkir");
    expect(life(game, B)).toBe(17);
  });
});

describe("token copies", () => {
  it("Doppelgang: X copies of each of X targets", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Forest", 4);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Doppelgang"), { x: 2, targets: [ref(bear), ref(giant)] });
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(2);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(2);
  });

  it("Devastating Onslaught: X hasty copies", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Devastating Onslaught"), { x: 2, targets: [ref(giant)] });
    const copies = named(game, "Hill Giant", A).filter((id) => id !== giant);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(2);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
  });

  it("Living Laser: one attacking copy for each card discarded this turn", () => {
    const { game, a } = table();
    const laser = spawn(game, "Living Laser");
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 2 }, []);
    const before = life(game, B);
    attack(game, a, [laser]);
    expect(tokensNamed(game, "Living Laser", A)).toBe(2);
    expect(life(game, B)).toBe(before - 12);
  });

  it("Saheeli, the Gifted: −7 copies each artifact you control", () => {
    const { game } = table();
    const saheeli = spawn(game, "Saheeli, the Gifted");
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    loyalty(game, saheeli, -7, { atLeast: 7 });
    expect(tokensNamed(game, "Sol Ring", A)).toBe(1);
    expect(tokensNamed(game, "Ornithopter", A)).toBe(1);
  });

  it("Endless Evil: a 1/1 copy each upkeep, and back to hand when a Horror dies", () => {
    const { game } = table();
    const rager = spawn(game, "Phyrexian Rager");
    lands(game, "Island", 3);
    const aura = toHand(game, "Endless Evil");
    cast(game, aura, { targets: [ref(rager)] });
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    const copy = named(game, "Phyrexian Rager", A).find((id) => id !== rager)!;
    expect(pt(game, copy)).toEqual({ power: 1, toughness: 1 });
    destroy(game, rager);
    settle(game);
    expect(zone(game, aura)).toBe("hand");
  });

  it("For the Common Good: X copies of a token, then life for each token", () => {
    const { game } = table();
    const token = game.debugApplyEffect(A, { kind: "create-token", token: "Servo Token", count: 1 }, []);
    void token;
    const servo = named(game, "Servo", A)[0] ?? named(game, "Servo Token", A)[0];
    lands(game, "Forest", 5);
    cast(game, toHand(game, "For the Common Good"), { x: 2, targets: [ref(servo)] });
    expect(life(game, A)).toBe(23);
  });
});

describe("control and other players' abilities", () => {
  it("Soul Ransom: an opponent's discard makes its controller sacrifice it and draw two", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const ransom = toHand(game, "Soul Ransom");
    cast(game, ransom, { targets: [ref(bear)] });
    expect(game.state.objects[bear].controller).toBe(A);
    nextTurn(game);
    const before = hand(game, A).length;
    activate(game, ransom, 0, { player: B });
    expect(zone(game, ransom)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 2);
    expect(game.state.objects[bear].controller).toBe(B);
  });
});
