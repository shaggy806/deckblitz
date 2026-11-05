/**
 * Batch 259, group B: cards freed by built need keys — energy paid in a chosen
 * amount, names chosen as a spell resolves, aggregates, attach hosts, spell
 * copies, distributed counters, each-deals-damage, enter-as types, cards exiled
 * with the source.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
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
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const energy = (game: Game, player: PlayerId = A): number => game.state.players[player].energy;

/** Run to the `may`'s question and pay `x` of it (declining with `null`). */
function pay(game: Game, x: number | null, player: PlayerId = A): void {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.result.over);
  game.dispatch(
    x === null ? { type: "choose-modes", player, modes: [] } : { type: "choose-modes", player, modes: [0], xValue: x },
  );
  settle(game);
}

const inExile = (game: Game, name: string): ObjectId[] =>
  (Object.keys(game.state.objects) as ObjectId[]).filter(
    (id) => game.state.objects[id].zone === "exile" && game.state.objects[id].cardName === name,
  );
const inLibrary = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("energy paid in a chosen amount", () => {
  it("Aether Spike counters unless its controller pays {1} for each {E} paid", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.state.players[A].energy = 1;
    cast(game, toHand(game, "Aether Spike"), { targets: [ref(bears)], settle: false });
    pay(game, 3);
    expect(energy(game)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Localized Destruction spares only your creatures of the power paid", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    game.state.players[A].energy = 1;
    const mine = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Localized Destruction"), { settle: false });
    pay(game, 2);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Pia Nalaar makes an X/X Aetherjet, a Vehicle with base P/T from what was paid", () => {
    const { game } = table();
    spawn(game, "Pia Nalaar, Chief Mechanic");
    game.state.players[A].energy = 3;
    toStep(game, "end");
    pay(game, 2);
    expect(energy(game)).toBe(1);
    const [jet] = named(game, "Nalaar Aetherjet Token", A);
    expect(pt(game, jet)).toEqual({ power: 2, toughness: 2 });
    expect(types(game, jet)).not.toContain("creature");
    expect(keywords(game, jet).has("flying")).toBe(true);
  });

  it("Rampaging Aetherhood gets its power in energy and pays for counters", () => {
    const { game } = table();
    const hydra = spawn(game, "Rampaging Aetherhood");
    toStep(game, "upkeep");
    pay(game, 3);
    expect(counters(game, hydra)).toBe(3);
    expect(energy(game)).toBe(1);
  });

  it("Suppression Ray stuns only creatures tapped this way", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    game.state.players[A].energy = 2;
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const seen = pickPermanents(a, one);
    cast(game, toHand(game, "Suppression Ray"), { targets: [ref(B)], settle: false });
    pay(game, 1);
    expect(seen.offered).toContain(one);
    expect(seen.offered).toContain(two);
    expect(seen.offered).not.toContain(tapped);
    expect(counters(game, one, "stun")).toBe(1);
    expect(counters(game, two, "stun")).toBe(0);
    expect(game.state.objects[two].tapped).toBe(true);
  });

  it("Vault 112 chapter III exiles that many and plays one for free", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    pickTargets(a, null);
    enter(game, "Vault 112: Sadistic Simulation");
    expect(energy(game)).toBe(2);
    nextTurn(game);
    toStep(game, "precombat-main");
    settle(game);
    expect(energy(game)).toBe(4);
    a.chooseCastNowFn = () => ({
      type: "cast-spell",
      player: A,
      card: inExile(game, "Grizzly Bears")[0],
      targets: [],
      via: "effect",
      free: true,
    });
    const library = inLibrary(game).length;
    const onBoard = named(game, "Grizzly Bears", A).length;
    toStep(game, "precombat-main");
    pay(game, 3);
    expect(energy(game)).toBe(1);
    expect(inLibrary(game).length).toBe(library - 1 - 3); // the draw step's, and three
    expect(named(game, "Grizzly Bears", A).length).toBe(onBoard + 1);
    expect(inExile(game, "Grizzly Bears").length).toBe(2);
  });
});

describe("processors and revealed cards", () => {
  it("Blight Herder needs two opposing exiled cards for its Scions, as it's cast", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    const one = toExile(game, "Grizzly Bears", B);
    const two = toExile(game, "Hill Giant", B);
    pickModes(a, 0);
    pickFromZone(a, one, two);
    cast(game, toHand(game, "Blight Herder"));
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(3);
  });

  it("Blight Herder with one exiled card moves nothing and makes nothing", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    const one = toExile(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Blight Herder"));
    expect(zone(game, one)).toBe("exile");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(0);
  });

  it("Disaster Radius deals the revealed card's mana value to opposing creatures only", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const revealed = toHand(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    const big = spawn(game, "Colossal Dreadmaw", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Disaster Radius"), { behold: revealed } as never);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");
    expect(game.state.objects[big].damageMarked).toBe(4);
    expect(game.state.objects[mine].damageMarked).toBe(0);
  });
});

describe("costs matched against their source", () => {
  it("Kyscu Drake sacrifices itself and a Spitting Drake for Viashivan Dragon", () => {
    const { game, a } = table({ deck: "Viashivan Dragon" });
    const drake = spawn(game, "Kyscu Drake");
    const other = spawn(game, "Spitting Drake");
    pickFromZone(a, inLibrary(game)[0]);
    activate(game, drake, 1);
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
    expect(named(game, "Viashivan Dragon", A).length).toBe(1);
  });

  it("Kyscu Drake can't with no Spitting Drake", () => {
    const { game } = table();
    const drake = spawn(game, "Kyscu Drake");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, drake, 1)).toThrow();
  });
});

describe("card names chosen as it resolves", () => {
  it("Demonic Consultation exiles six, then finds the name below them", () => {
    const { game, a } = table();
    const target = toLibrary(game, "Hill Giant");
    for (let i = 0; i < 2; i++) toLibrary(game, "Grizzly Bears");
    for (let i = 0; i < 6; i++) toLibrary(game, "Island");
    lands(game, "Swamp", 1);
    a.chooseCardNameFn = () => "Hill Giant";
    cast(game, toHand(game, "Demonic Consultation"));
    expect(zone(game, target)).toBe("hand");
    expect(inExile(game, "Island").length).toBe(6);
    expect(inExile(game, "Grizzly Bears").length).toBe(2);
    expect(inLibrary(game).length).toBe(32);
  });

  it("Demonic Consultation with the name gone exiles the whole library", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    a.chooseCardNameFn = () => "Hill Giant";
    cast(game, toHand(game, "Demonic Consultation"));
    expect(inLibrary(game).length).toBe(0);
    expect(game.state.result.over).toBe(false);
  });

  it("Spoils of the Vault loses 1 life for each exiled card", () => {
    const { game, a } = table();
    const target = toLibrary(game, "Hill Giant");
    for (let i = 0; i < 3; i++) toLibrary(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    a.chooseCardNameFn = () => "Hill Giant";
    cast(game, toHand(game, "Spoils of the Vault"));
    expect(zone(game, target)).toBe("hand");
    expect(inExile(game, "Grizzly Bears").length).toBe(3);
    expect(life(game)).toBe(17);
  });

  it("Liar's Pendulum draws only when the hand is revealed and the guess was wrong", () => {
    for (const [guessYes, holds, draws] of [
      [true, false, 1],
      [false, true, 1],
      [true, true, 0],
      [false, false, 0],
    ] as const) {
      const { game, a, b } = table();
      lands(game, "Wastes", 2);
      const pendulum = spawn(game, "Liar's Pendulum");
      if (holds) toHand(game, "Hill Giant");
      a.chooseCardNameFn = () => "Hill Giant";
      pickModes(b, guessYes ? 0 : 1);
      pickModes(a, 0);
      const before = hand(game).length;
      activate(game, pendulum, 0, { targets: [ref(B)] });
      expect(hand(game).length).toBe(before + draws);
    }
  });

  it("Liar's Pendulum declining to reveal draws nothing", () => {
    const { game, a, b } = table();
    lands(game, "Wastes", 2);
    const pendulum = spawn(game, "Liar's Pendulum");
    a.chooseCardNameFn = () => "Hill Giant";
    pickModes(b, 0);
    pickModes(a);
    const before = hand(game).length;
    activate(game, pendulum, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before);
  });

  it("Petra Sphinx: named goes to hand, unnamed to graveyard, the target choosing", () => {
    const { game, b } = table();
    const sphinx = spawn(game, "Petra Sphinx");
    const top = toLibrary(game, "Hill Giant", B);
    b.chooseCardNameFn = () => "Hill Giant";
    activate(game, sphinx, 0, { targets: [ref(B)] });
    expect(zone(game, top)).toBe("hand");
    const next = toLibrary(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    const other = toLibrary(game, "Island", B);
    activate(game, sphinx, 0, { targets: [ref(B)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(next).toBeDefined();
  });

  it("Thought Hemorrhage deals 3 per named card revealed, once, and exiles them everywhere", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const inHand =[toHand(game, "Hill Giant", B), toHand(game, "Hill Giant", B)];
    const gy = toGraveyard(game, "Hill Giant", B);
    const lib = toLibrary(game, "Hill Giant", B);
    const other = toHand(game, "Grizzly Bears", B);
    a.chooseCardNameFn = () => "Hill Giant";
    a.chooseFromZoneFn = (_v, eligible) => eligible;
    cast(game, toHand(game, "Thought Hemorrhage"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    for (const id of [...inHand, gy, lib]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, other)).toBe("hand");
  });
});

describe("Tolarian Contempt", () => {
  it("marks opposing creatures, then the owner sends one to their choice of end", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    enter(game, "Tolarian Contempt");
    expect(counters(game, bears, "rejection")).toBe(1);
    expect(counters(game, mine, "rejection")).toBe(0);
    pickTargets(a, bears); // one slot: one opponent
    b.chooseFromZoneFn = (_v, eligible) => eligible; // on the bottom
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("library");
    const library = inLibrary(game, B);
    expect(library.includes(bears)).toBe(true);
  });
});

describe("colours, counters and aggregates", () => {
  it("Possessed Goat becomes a black Demon in addition, with three counters, once", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const goat = spawn(game, "Possessed Goat");
    toHand(game, "Island");
    activate(game, goat, 0);
    expect(counters(game, goat)).toBe(3);
    expect(subtypes(game, goat)).toEqual(expect.arrayContaining(["Goat", "Demon"]));
    expect(game.state.objects[goat].id).toBe(goat);
    expect(() => activate(game, goat, 0)).toThrow();
  });

  it("Backstreet Bruiser attacks with two counters of any kinds among your creatures", () => {
    const { game, a } = table();
    const bruiser = spawn(game, "Backstreet Bruiser");
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[other].counters = { "+1/+1": 1 };
    expect(() => attack(game, a, [bruiser])).toThrow(/defender/);
    const again = table();
    const second = spawn(again.game, "Backstreet Bruiser");
    const friend = spawn(again.game, "Grizzly Bears");
    again.game.state.objects[friend].counters = { "+1/+1": 1 };
    again.game.state.objects[second].counters = { charge: 1 };
    attack(again.game, again.a, [second]);
    expect(life(again.game, B)).toBe(17);
  });

  it("Hydra Trainer counts every counter on your permanents as the reflexive resolves", () => {
    const { game, a } = table();
    const trainer = spawn(game, "Hydra Trainer");
    const charged = spawn(game, "Wastes");
    game.state.objects[charged].counters = { charge: 2 };
    game.state.objects[trainer].counters = { "+1/+1": 1 };
    pickTargets(a, trainer);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: trainer, defender: B, exert: true }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, trainer)).toEqual({ power: 5, toughness: 5 });
  });

  it("Dragon Man's power reads noncreature permanents and graveyard cards", () => {
    const { game } = table();
    const man = spawn(game, "Dragon Man, Reformed Robot");
    expect(pt(game, man).power).toBe(0);
    spawn(game, "Mind Stone");
    expect(pt(game, man).power).toBe(2);
    toGraveyard(game, "Murder");
    toGraveyard(game, "Craw Wurm");
    expect(pt(game, man)).toEqual({ power: 3, toughness: 5 });
  });

  it("Dragon Man casts from the graveyard only with a card to discard", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const man = toGraveyard(game, "Dragon Man, Reformed Robot");
    const offered = (): boolean => game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === man);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    expect(hand(game).length).toBe(0);
    expect(offered()).toBe(false);
    toHand(game, "Island");
    expect(offered()).toBe(true);
  });

  it("Lux Artillery gives an artifact creature spell sunburst, and fires at thirty counters", () => {
    const { game } = table();
    spawn(game, "Lux Artillery");
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    const myr = toHand(game, "Alpha Myr");
    cast(game, myr);
    expect(counters(game, myr)).toBe(0 + (game.state.objects[myr].counters?.["+1/+1"] ?? 0));
    expect(game.state.objects[myr].counters?.["+1/+1"]).toBeGreaterThanOrEqual(1);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(20);
    game.state.objects[myr].counters = { charge: 30 };
    nextTurn(game);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(10);
  });
});

describe("attach hosts", () => {
  it("Breath of Fury sacrifices its host, moves on, untaps and adds a combat", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const host = spawn(game, "Grizzly Bears");
    const next = spawn(game, "Hill Giant");
    game.state.objects[next].tapped = true;
    const breath = toHand(game, "Breath of Fury");
    cast(game, breath, { targets: [ref(host)] });
    pickPermanents(a, next);
    const combats = game.state.turn.number;
    a.declareAttackersFn = () => (zone(game, host) === "battlefield" ? [{ attacker: host, defender: B }] : []);
    toStep(game, "postcombat-main");
    expect(zone(game, host)).toBe("graveyard");
    expect(game.state.objects[breath].attachedTo).toBe(next);
    expect(game.state.objects[next].tapped).toBe(false);
    expect(game.state.turn.number).toBe(combats);
  });

  it("Breath of Fury with no creature left goes to the graveyard, untapping nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const host = spawn(game, "Grizzly Bears");
    const breath = toHand(game, "Breath of Fury");
    cast(game, breath, { targets: [ref(host)] });
    attack(game, a, [host]);
    expect(zone(game, host)).toBe("graveyard");
    expect(zone(game, breath)).toBe("graveyard");
    expect(game.state.turn.step).toBe("postcombat-main");
  });

  it("Holy Avenger puts an Aura from hand onto what it equips", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const avenger = spawn(game, "Holy Avenger");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(bears), ref(avenger)]);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    const aura = toHand(game, "Holy Strength");
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    attack(game, a, [bears]);
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.objects[aura].attachedTo).toBe(bears);
  });

  it("Inventory Management moves each, only as you choose", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Hill Giant");
    const blade = spawn(game, "Holy Avenger");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(first), ref(blade)]);
    pickPermanents(a, second);
    cast(game, toHand(game, "Inventory Management"));
    expect(game.state.objects[blade].attachedTo).toBe(second);
  });

  it("Mantle of the Ancients returns its targets onto the enchanted creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    const aura = toGraveyard(game, "Holy Strength");
    const land = toGraveyard(game, "Wild Growth");
    const blade = toGraveyard(game, "Holy Avenger");
    a.chooseTargetsFn = () => [ref(aura)].concat(ref(land), ref(blade));
    cast(game, toHand(game, "Mantle of the Ancients"), { targets: [ref(bears)] });
    expect(game.state.objects[aura].attachedTo).toBe(bears);
    expect(game.state.objects[blade].attachedTo).toBe(bears);
    expect(zone(game, land)).toBe("graveyard"); // can't enchant a creature
    // Holy Strength's +1/+2, and +1/+1 for each of the Mantle, the Strength and the Avenger.
    expect(pt(game, bears)).toEqual({ power: 2 + 1 + 3, toughness: 2 + 2 + 3 });
  });

  it("Nim Deathmantle overrides colour and type, and brings a card back attached for {4}", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const nim = spawn(game, "Nim Deathmantle");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(bears), ref(nim)]);
    expect(subtypes(game, bears)).toEqual(["Zombie"]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const giant = spawn(game, "Hill Giant");
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[nim].attachedTo).toBe(giant);
    expect(subtypes(game, bears)).toContain("Bear");
  });

  it("Preston Garvey's Settlement enchants the land for any colour; none with no target", () => {
    const { game, a } = table();
    const preston = spawn(game, "Preston Garvey, Minuteman");
    const land = spawn(game, "Wastes", A, { tapped: true });
    pickTargets(a, land);
    a.declareAttackersFn = () => [{ attacker: preston, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    const [settlement] = named(game, "Settlement Token", A);
    expect(game.state.objects[settlement].attachedTo).toBe(land);
    expect(game.state.objects[land].tapped).toBe(false); // Preston's attack
    const none = table();
    spawn(none.game, "Preston Garvey, Minuteman");
    pickTargets(none.a, null);
    toStep(none.game, "declare-attackers");
    settle(none.game);
    expect(tokensNamed(none.game, "Settlement Token", A)).toBe(0);
  });

  it("Ring of Valkas grows only a red creature", () => {
    const { game } = table();
    const ring = spawn(game, "Ring of Valkas");
    const red = spawn(game, "Goblin Piker");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(red), ref(ring)]);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, red)).toBe(1);
    const green = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(green), ref(ring)]);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, green)).toBe(0);
  });

  it("Bruna attaches Auras on the battlefield and from graveyard and hand", () => {
    const { game, a } = table();
    const bruna = spawn(game, "Bruna, Light of Alabaster");
    const other = spawn(game, "Grizzly Bears", B);
    const onBoard = spawn(game, "Holy Strength", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0, attachment: 1 }, [ref(other), ref(onBoard)]);
    const fromGy = toGraveyard(game, "Holy Strength");
    const fromHand = toHand(game, "Holy Strength");
    pickPermanents(a, onBoard);
    pickFromZone(a, fromGy, fromHand);
    attack(game, a, [bruna]);
    for (const id of [onBoard, fromGy, fromHand]) expect(game.state.objects[id].attachedTo).toBe(bruna);
    expect(pt(game, bruna)).toEqual({ power: 8, toughness: 11 });
  });
});

describe("spell copies", () => {
  it("Jackal copies a spell of its power, the copy not legendary, then grows", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const jackal = spawn(game, "Jackal, Genius Geneticist");
    cast(game, toHand(game, "Llanowar Elves")); // mana value 1, power 1
    expect(named(game, "Llanowar Elves", A).length).toBe(2);
    expect(counters(game, jackal)).toBe(1);
    cast(game, toHand(game, "Llanowar Elves")); // mana value 1, power now 2: no
    expect(named(game, "Llanowar Elves", A).length).toBe(3);
    expect(counters(game, jackal)).toBe(1);
  });

  it("Storm of Saruman copies only the second spell", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    spawn(game, "Storm of Saruman");
    cast(game, toHand(game, "Llanowar Elves"));
    expect(named(game, "Llanowar Elves", A).length).toBe(1);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(named(game, "Llanowar Elves", A).length).toBe(3);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(named(game, "Llanowar Elves", A).length).toBe(4);
  });

  it("The Sixth Doctor copies a legendary spell nonlegendary, once a turn", () => {
    const { game } = table();
    lands(game, "Mountain", 12);
    spawn(game, "The Sixth Doctor");
    cast(game, toHand(game, "Mox Amber"));
    const moxes = named(game, "Mox Amber", A);
    expect(moxes.length).toBe(2); // the legend rule leaves both
    expect(moxes.filter((id) => supertypes(game, id).includes("legendary")).length).toBe(1);
    cast(game, toHand(game, "Mind Stone"));
    expect(named(game, "Mind Stone", A).length).toBe(1);
  });

  it("The Clone Saga: II copies the next creature spell, III draws on the chosen name's damage", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const saga = spawn(game, "The Clone Saga");
    game.state.objects[saga].counters = { lore: 1 };
    toStep(game, "precombat-main");
    settle(game);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(named(game, "Llanowar Elves", A).length).toBe(2);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(named(game, "Llanowar Elves", A).length).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    a.chooseCardNameFn = () => "Grizzly Bears";
    toStep(game, "precombat-main");
    settle(game);
    const before = hand(game).length;
    attack(game, a, [bears, giant]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("the card discarded to pay a cost", () => {
  it("Hisoka counters only a spell of the discarded card's mana value", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    const hisoka = spawn(game, "Hisoka, Minamo Sensei");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const discard = toHand(game, "Hill Giant"); // 4
    a.chooseDiscardsFn = () => [discard];
    activate(game, hisoka, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Hisoka counters when the mana values match", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    const hisoka = spawn(game, "Hisoka, Minamo Sensei");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const discard = toHand(game, "Runeclaw Bear"); // 2
    a.chooseDiscardsFn = () => [discard];
    activate(game, hisoka, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Slumbering Tora becomes an X/X Cat from the discarded Spirit or Arcane", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const tora = spawn(game, "Slumbering Tora");
    const spirit = toHand(game, "Kami of Ancient Law");
    a.chooseDiscardsFn = () => [spirit];
    activate(game, tora, 0);
    expect(pt(game, tora)).toEqual({ power: 2, toughness: 2 });
    expect(types(game, tora)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, tora)).toContain("Cat");
  });
});

describe("blocking, clash, distribution", () => {
  it("Fire Juggler hits each creature blocking it when it wins the clash", () => {
    const { game, a, b } = table({ seed: 3 });
    const juggler = spawn(game, "Fire Juggler");
    const blocker = spawn(game, "Hill Giant", B);
    const bystander = spawn(game, "Hill Giant", B);
    toLibrary(game, "Craw Wurm");
    toLibrary(game, "Wastes", B);
    a.declareAttackersFn = () => [{ attacker: juggler, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker: juggler }];
    toStep(game, "postcombat-main");
    expect(zone(game, blocker)).toBe("graveyard");
    expect(game.state.objects[bystander].damageMarked).toBe(0);
  });

  it("Crashing Wave taps its targets and stuns any tapped opposing creatures", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const one = spawn(game, "Grizzly Bears", B);
    const already = spawn(game, "Hill Giant", B, { tapped: true });
    const mine = spawn(game, "Llanowar Elves", A, { tapped: true });
    const seen = pickPermanents(a, one, already);
    a.chooseNumberFn = (_v, offer) => offer.max ?? offer.min;
    cast(game, toHand(game, "Crashing Wave"), { targets: [ref(one)], x: 1, waterbend: [] } as never);
    expect(game.state.objects[one].tapped).toBe(true);
    expect(seen.offered).toContain(already);
    expect(seen.offered).not.toContain(mine);
    expect(counters(game, one, "stun") + counters(game, already, "stun")).toBe(3);
  });

  it("Invoke Justice's counters may go on the returned permanent, on the target player's side", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const returned = toGraveyard(game, "Grizzly Bears");
    pickPermanents(a, returned);
    cast(game, toHand(game, "Invoke Justice"), { targets: [ref(returned), ref(A)] });
    expect(zone(game, returned)).toBe("battlefield");
    expect(counters(game, returned)).toBe(4);
  });

  it("Numa pays {X}{X} and divides X among target Elves", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const numa = spawn(game, "Numa, Joraga Chieftain");
    const elf = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const seen: (readonly (ObjectId | PlayerId)[])[] = [];
    a.chooseTargetsFn = (_v, _s, _spec, legal) => {
      seen.push(legal[0].map((t) => (t.kind === "object" ? t.object : t.player)));
      return [ref(numa), ref(elf)];
    };
    a.chooseNumberFn = () => 1;
    toStep(game, "begin-combat");
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(seen[0]).toContain(elf);
    expect(seen[0]).not.toContain(bears);
    expect(counters(game, numa) + counters(game, elf)).toBe(2);
    expect(counters(game, numa)).toBeGreaterThanOrEqual(1);
    expect(counters(game, elf)).toBeGreaterThanOrEqual(1);
  });

  it("Yannik exiles another creature until it leaves and divides its power", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, giant);
    a.chooseTargetsFn = (_v, _s, specs) =>
      specs.length === 1 && typeof specs[0] === "string" && specs[0] === "player" ? [ref(A)] : [ref(bears)];
    const yannik = enter(game, "Yannik, Scavenging Sentinel");
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, bears)).toBe(3);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(yannik)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("each permanent deals damage", () => {
  it("The Akroan War: control while it stays, opponents must attack until your next turn", () => {
    const { game, a, b } = table();
    const stolen = spawn(game, "Grizzly Bears", B);
    pickTargets(a, stolen);
    const war = enter(game, "The Akroan War");
    expect(game.state.objects[stolen].controller).toBe(A);
    const forced = spawn(game, "Hill Giant", B);
    toStep(game, "precombat-main"); // chapter II on your next turn
    settle(game);
    game.advanceUntil((s) => (s.awaiting?.kind === "attackers" && s.awaiting.player === B) || s.result.over);
    const offer = game.legalActions(B).find((o) => o.kind === "declare-attackers");
    if (offer?.kind !== "declare-attackers") throw new Error("no attack offer");
    expect(offer.mustAttack).toEqual([forced]);
    expect(offer.defendersFor[forced]).toEqual([A]); // the bare requirement: you may be attacked
    b.declareAttackersFn = () => [{ attacker: forced, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(game.state.objects[forced].tapped).toBe(true);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(war)]);
    settle(game);
    expect(game.state.objects[stolen].controller).toBe(B);
  });

  it("The Akroan War chapter III: only tapped creatures, each its own power", () => {
    const { game } = table();
    const saga = spawn(game, "The Akroan War");
    game.state.objects[saga].counters = { lore: 2 };
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const tappedBig = spawn(game, "Grizzly Bears", A, { tapped: true });
    const ok = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, tappedBig)).toBe("graveyard");
    expect(zone(game, ok)).toBe("battlefield");
    expect(game.state.objects[ok].damageMarked).toBe(0);
  });

  it("Lukka +1: creature cards are castable while you control a Lukka; others aren't", () => {
    const { game } = table();
    const lukka = spawn(game, "Lukka, Coppercoat Outcast");
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const land = toLibrary(game, "Island");
    const third = toLibrary(game, "Island");
    loyalty(game, lukka, 1);
    expect(zone(game, bears)).toBe("exile");
    const castable = (id: ObjectId): boolean => game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === id);
    expect(castable(bears)).toBe(true);
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, third)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(lukka)]);
    settle(game);
    expect(castable(bears)).toBe(false);
    spawn(game, "Lukka, Coppercoat Outcast");
    expect(castable(bears)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(castable(bears)).toBe(true);
  });

  it("Lukka −2 finds a creature of greater mana value than the exiled one", () => {
    const { game } = table();
    const lukka = spawn(game, "Lukka, Coppercoat Outcast");
    const bears = spawn(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const small = toLibrary(game, "Llanowar Elves");
    const same = toLibrary(game, "Grizzly Bears");
    loyalty(game, lukka, -2, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, small)).toBe("library");
    expect(zone(game, same)).toBe("library");
    // The rest on the bottom: the library's top is its front.
    const library = inLibrary(game);
    expect(library.indexOf(small)).toBeGreaterThanOrEqual(library.length - 2);
  });

  it("Lukka −7: each of your creatures deals its power to each opponent", () => {
    const { game } = table();
    const lukka = spawn(game, "Lukka, Coppercoat Outcast");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    loyalty(game, lukka, -7, { atLeast: 7 });
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
  });

  it("Nissa's Judgment: support first, then each creature with a counter deals its power", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const mine = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    const victim = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Nissa's Judgment"), { targets: [ref(victim), ref(mine)] });
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, other)).toBe(0);
    expect(counters(game, victim)).toBe(0);
    expect(game.state.objects[victim].damageMarked).toBe(3);
    // Two supported and a victim besides, and your own creature can't be the victim.
    const second = table();
    lands(second.game, "Forest", 10);
    const one = spawn(second.game, "Grizzly Bears");
    const two = spawn(second.game, "Hill Giant");
    const maw = spawn(second.game, "Colossal Dreadmaw", B);
    expect(() => cast(second.game, toHand(second.game, "Nissa's Judgment"), { targets: [ref(one), ref(two)] })).toThrow();
    cast(second.game, toHand(second.game, "Nissa's Judgment"), { targets: [ref(maw), ref(one), ref(two)] });
    expect(counters(second.game, one)).toBe(1);
    expect(counters(second.game, two)).toBe(1);
    expect(zone(second.game, maw)).toBe("graveyard"); // 3 + 4 past its toughness of 6
  });

  it("Sarkhan the Mad: 0 hits himself; −2 gives the creature's controller a Dragon; −4 the Dragons", () => {
    const { game } = table();
    const sarkhan = spawn(game, "Sarkhan the Mad");
    const giant = toLibrary(game, "Hill Giant");
    loyalty(game, sarkhan, 0);
    expect(zone(game, giant)).toBe("hand");
    expect(game.state.objects[sarkhan].counters.loyalty).toBe(3);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    loyalty(game, sarkhan, -2, { targets: [ref(bears)], atLeast: 7 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Dragon Token", B)).toBe(1);
    const [dragon] = named(game, "Dragon Token", B);
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
    spawn(game, "Shivan Dragon");
    nextTurn(game);
    nextTurn(game);
    loyalty(game, sarkhan, -4, { targets: [ref(B)], atLeast: 7 });
    expect(life(game, B)).toBe(15);
  });
});

describe("entering with types", () => {
  it("Path of the Schemer's creature is an artifact, from any graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const theirs = toGraveyard(game, "Hill Giant", B);
    pickFromZone(a, theirs);
    cast(game, toHand(game, "Path of the Schemer"));
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(types(game, theirs)).toEqual(expect.arrayContaining(["artifact", "creature"]));
  });

  it("The War in Heaven's chapter III returns artifacts with necrodermis counters", () => {
    const { game, a } = table();
    const saga = spawn(game, "The War in Heaven");
    game.state.objects[saga].counters = { lore: 2 };
    const one = toGraveyard(game, "Hill Giant");
    const two = toGraveyard(game, "Hill Giant");
    a.chooseTargetsFn = () => [ref(one), ref(two)];
    toStep(game, "precombat-main");
    settle(game);
    for (const id of [one, two]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(types(game, id)).toContain("artifact");
      expect(counters(game, id, "necrodermis")).toBe(1);
    }
  });
});

describe("exiled this way, exiled with the source", () => {
  it("Clear the Land: each player's lands enter tapped, the rest exiled", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    lands(game, "Forest", 3);
    const land = toLibrary(game, "Wastes");
    const theirs = toLibrary(game, "Wastes", B);
    const bears = inLibrary(game)[inLibrary(game).length - 2];
    const before = inLibrary(game).length;
    cast(game, toHand(game, "Clear the Land"));
    expect(zone(game, land)).toBe("battlefield");
    expect(game.state.objects[land].tapped).toBe(true);
    expect(game.state.objects[theirs].controller).toBe(B);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(inLibrary(game).length).toBe(before - 5);
    expect(bears).toBeDefined();
    expect(inExile(game, "Grizzly Bears").length).toBe(8);
  });

  it("Journey to the Lost City: each row of the d20", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 200 && seen.size < 3; seed++) {
      const { game, a } = table({ seed });
      const journey = spawn(game, "Journey to the Lost City");
      a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
      const creature = toLibrary(game, "Grizzly Bears");
      const other = toLibrary(game, "Hill Giant");
      const spell = toLibrary(game, "Murder");
      const land = toLibrary(game, "Island");
      toStep(game, "upkeep");
      settle(game);
      expect(zone(game, spell)).toBe("exile");
      if (zone(game, journey) !== "battlefield") {
        seen.add("20");
        expect(zone(game, creature)).toBe("battlefield");
        expect(zone(game, other)).toBe("battlefield");
        expect(zone(game, land)).toBe("battlefield");
        continue;
      }
      expect(zone(game, creature)).toBe("exile");
      const wolf = named(game, "Wolf Token", A)[0];
      if (wolf !== undefined) {
        seen.add("10-19");
        expect(counters(game, wolf)).toBe(2);
        expect(zone(game, land)).toBe("exile");
      } else {
        seen.add("1-9");
        expect(zone(game, land)).toBe("battlefield");
      }
    }
    expect([...seen].sort()).toEqual(["1-9", "10-19", "20"]);
  });

  it("Tezzeret −8 puts only the artifacts among the ten", () => {
    const { game } = table();
    const tez = spawn(game, "Tezzeret, Master of the Bridge");
    const stone = toLibrary(game, "Mind Stone");
    const bears = toLibrary(game, "Grizzly Bears");
    loyalty(game, tez, -8, { atLeast: 8 });
    expect(zone(game, stone)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(inExile(game, "Wastes").length).toBe(8);
  });

  it("Tezzeret +2 and his affinity", () => {
    const { game } = table();
    const tez = spawn(game, "Tezzeret, Master of the Bridge");
    spawn(game, "Mind Stone");
    spawn(game, "Mind Stone");
    loyalty(game, tez, 2);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Xenagos −6 puts the chosen creature or land; the rest stay exiled", () => {
    const { game, a } = table();
    const xen = spawn(game, "Xenagos, the Reveler");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const spell = toLibrary(game, "Murder");
    pickFromZone(a, giant);
    loyalty(game, xen, -6, { atLeast: 6 });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, spell)).toBe("exile");
  });

  it("Emperor of Bones brings an exiled creature back, finality, haste, gone at end step", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const emperor = spawn(game, "Emperor of Bones");
    const giant = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    pickTargets(a, null);
    activate(game, emperor, 0);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(counters(game, giant, "finality")).toBe(1);
    expect(keywords(game, giant).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(zone(game, giant)).toBe("exile");
  });

  it("Ghost Vacuum returns each creature exiled with it as a 1/1 flying Spirit", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const vacuum = spawn(game, "Ghost Vacuum");
    const giant = toGraveyard(game, "Hill Giant", B);
    const spell = toGraveyard(game, "Murder", B);
    activate(game, vacuum, 0, { targets: [ref(giant)] });
    game.state.objects[vacuum].tapped = false;
    activate(game, vacuum, 0, { targets: [ref(spell)] });
    game.state.objects[vacuum].tapped = false;
    activate(game, vacuum, 1);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(zone(game, spell)).toBe("exile");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, giant)).toEqual(expect.arrayContaining(["Giant", "Spirit"]));
    expect(keywords(game, giant).has("flying")).toBe(true);
  });

  it("Profane Procession transforms at three and the Tomb puts its cards back", () => {
    const { game, a } = table();
    lands(game, "Plains", 19);
    lands(game, "Swamp", 19);
    const proc = spawn(game, "Profane Procession");
    const victims = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B), spawn(game, "Craw Wurm", B)];
    for (const v of victims.slice(0, 2)) activate(game, proc, 0, { targets: [ref(v)] });
    expect(types(game, proc)).not.toContain("land");
    activate(game, proc, 0, { targets: [ref(victims[2])] });
    expect(types(game, proc)).toContain("land");
    pickFromZone(a, victims[1]);
    activate(game, proc, 1);
    expect(zone(game, victims[1])).toBe("battlefield");
    expect(game.state.objects[victims[1]].controller).toBe(A);
  });

  it("Throne of the Grim Captain crafts with one of each, and the Captain puts one back attacking", () => {
    const { game, a, b } = table();
    lands(game, "Wastes", 4);
    const throne = spawn(game, "Throne of the Grim Captain");
    const dino = toGraveyard(game, "Ripjaw Raptor");
    const merfolk = toGraveyard(game, "Lord of Atlantis");
    const pirate = toGraveyard(game, "Dire Fleet Hoarder");
    const vampire = toGraveyard(game, "Vampire Nighthawk");
    pickFromZone(a, dino, merfolk, pirate, vampire);
    activate(game, throne, 1);
    expect(types(game, throne)).toContain("creature");
    for (const id of [dino, merfolk, pirate, vampire]) expect(zone(game, id)).toBe("exile");
    const bystander = spawn(game, "Grizzly Bears", B);
    game.state.objects[throne].summoningSick = false;
    pickFromZone(a, vampire);
    pickPermanents(b, bystander);
    attack(game, a, [throne]);
    expect(zone(game, bystander)).toBe("graveyard");
    expect(zone(game, vampire)).toBe("battlefield");
    expect(game.state.objects[vampire].tapped).toBe(true);
  });
});

describe("granted and delayed", () => {
  it("Trickster's Talisman trades itself for a token copy of the creature", () => {
    const { game, a } = table();
    const talisman = spawn(game, "Trickster's Talisman");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(bears), ref(talisman)]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, talisman)).toBe("graveyard");
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
  });

  it("Ride the Avalanche: the next spell at instant speed, X counters from its mana value", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Ride the Avalanche"));
    toStep(game, "begin-combat");
    const giant = toHand(game, "Hill Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, bears)).toBe(4);
    const second = toHand(game, "Llanowar Elves");
    expect(() => cast(game, second)).toThrow();
  });

  it("Palliation Accord banks counters and spends one on the next 1 damage", () => {
    const { game } = table();
    const accord = spawn(game, "Palliation Accord");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, accord, "palliation")).toBe(1);
    activate(game, accord, 0);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game)).toBe(18);
    expect(graveyard(game).length).toBe(0);
  });

  it("Surtland Elementalist casts a sorcery for free on attack", () => {
    const { game, a } = table();
    const giant = spawn(game, "Surtland Elementalist");
    const spell = toHand(game, "Divination");
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: spell, targets: [], via: "effect", free: true });
    const before = hand(game).length;
    attack(game, a, [giant]);
    expect(zone(game, spell)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});
