/**
 * Streets of New Capenna (and New Capenna Commander), group c. One test (or
 * two) per card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { goadersOf } from "../goad.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  activate,
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
  pickPermanents,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** A real token (debugSpawn'd ones aren't tokens), created for `player`. */
const makeToken = (game: Game, name: string, player = A): ObjectId => {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 }, []);
  settle(game);
  return game.battlefield.find((id) => !before.has(id))!;
};

/** The seat picks the mode whose text starts with `prefix`. */
const pickModeText = (seat: ScriptedController, prefix: string): void => {
  seat.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => t.startsWith(prefix))];
};

describe("Run Out of Town", () => {
  it("the permanent's owner chooses top or bottom of their library", () => {
    const { game, a, b } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    let bobAsked = false;
    b.chooseModesFn = () => {
      bobAsked = true;
      return [1];
    };
    a.chooseModesFn = () => {
      throw new Error("alice isn't the owner");
    };
    cast(game, toHand(game, "Run Out of Town"), { targets: [{ kind: "object", object: bears }] });
    expect(bobAsked).toBe(true);
    expect(zone(game, bears)).toBe("library");
    expect(library(game, B).at(-1)).toBe(bears);
  });
});

describe("Cleanup Crew", () => {
  it("exiles a chosen card from any graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears", A);
    const theirs = toGraveyard(game, "Hill Giant", B);
    pickModeText(a, "Exile");
    const seen = watchTargets(a, () => [theirs]);
    enter(game, "Cleanup Crew");
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0].length).toBe(2);
    expect(zone(game, theirs)).toBe("exile");
  });

  it("or gains 4 life", () => {
    const { game, a } = table();
    pickModeText(a, "You gain");
    enter(game, "Cleanup Crew");
    expect(life(game)).toBe(24);
  });

  it("or destroys an artifact", () => {
    const { game, a } = table();
    const relic = spawn(game, "Ornithopter", B);
    pickModeText(a, "Destroy target artifact");
    pickTargets(a, relic);
    enter(game, "Cleanup Crew");
    expect(zone(game, relic)).toBe("graveyard");
  });
});

describe("Ominous Parcel", () => {
  it("{5}, {T}, sacrifice: 4 damage to target creature", () => {
    const { game } = table();
    const parcel = spawn(game, "Ominous Parcel");
    lands(game, "Wastes", 5);
    const angel = spawn(game, "Serra Angel", B);
    activate(game, parcel, 1, { targets: [{ kind: "object", object: angel }] });
    expect(zone(game, parcel)).toBe("graveyard");
    expect(zone(game, angel)).toBe("graveyard");
  });

  it("{2}, {T}, sacrifice: fetch a basic land to hand", () => {
    const { game, a } = table();
    const parcel = spawn(game, "Ominous Parcel");
    lands(game, "Wastes", 2);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    activate(game, parcel, 0);
    expect(zone(game, forest)).toBe("hand");
  });
});

describe("Brokers Initiate", () => {
  it("has base power and toughness 5/5 until end of turn, counters on top", () => {
    const { game } = table();
    const initiate = spawn(game, "Brokers Initiate");
    game.state.objects[initiate].counters["+1/+1"] = 1;
    lands(game, "Wastes", 4);
    lands(game, "Forest", 1);
    expect(pt(game, initiate)).toEqual({ power: 1, toughness: 5 });
    activate(game, initiate, 0);
    expect(pt(game, initiate)).toEqual({ power: 6, toughness: 6 });
    nextTurn(game);
    expect(pt(game, initiate)).toEqual({ power: 1, toughness: 5 });
  });
});

describe("Bellowing Mauler", () => {
  it("each player loses 4 life unless they sacrifice a nontoken creature", () => {
    const { game, a, b } = table();
    spawn(game, "Bellowing Mauler");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a); // alice keeps her creatures
    pickModes(b, 0); // bob sacrifices
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a token can't be sacrificed to it", () => {
    const { game, a, b } = table();
    spawn(game, "Bellowing Mauler");
    makeToken(game, "Citizen Token", B);
    pickModes(a);
    pickModes(b, 0);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(tokensNamed(game, "Citizen Token", B)).toBe(1);
  });
});

describe("Dusk Mangler", () => {
  it("can be cast paying 4 life; each opponent sacrifices, discards and loses 4", () => {
    const { game, b } = table();
    lands(game, "Swamp", 7);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Hill Giant", B);
    b.chooseDiscardsFn = () => [card];
    const mangler = toHand(game, "Dusk Mangler");
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "cast-spell" && x.card === mangler && x.costOptionText === "Pay 4 life");
    expect(offer?.kind).toBe("cast-spell");
    cast(game, mangler, { costOption: offer?.kind === "cast-spell" ? offer.costOption : undefined });
    expect(life(game, A)).toBe(16);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });

  it("offers the three additional costs", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    spawn(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const mangler = toHand(game, "Dusk Mangler");
    const texts = game
      .legalActions(A)
      .flatMap((x) => (x.kind === "cast-spell" && x.card === mangler ? [x.costOptionText] : []))
      .sort();
    expect(texts).toEqual(["Discard a card", "Pay 4 life", "Sacrifice a creature"]);
  });
});

describe("Body Launderer", () => {
  it("connives when another nontoken creature you control dies, not a token", () => {
    const { game, a } = table();
    const launderer = spawn(game, "Body Launderer");
    const bears = spawn(game, "Grizzly Bears");
    const token = makeToken(game, "Citizen Token");
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    destroy(game, token);
    expect(counters(game, launderer)).toBe(0);
    expect(zone(game, giant)).toBe("hand");
    destroy(game, bears);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, launderer)).toBe(1);
  });

  it("dying, returns a non-Rogue creature card with power up to its last power", () => {
    const { game, a } = table();
    const launderer = spawn(game, "Body Launderer");
    game.state.objects[launderer].counters["+1/+1"] = 1; // 4/4 as it dies
    const angel = toGraveyard(game, "Serra Angel"); // power 4
    const bears = toGraveyard(game, "Grizzly Bears");
    const rogue = toGraveyard(game, "Mine Raider"); // a Rogue
    const titan = toGraveyard(game, "Hill Giant", B); // not yours
    const seen = watchTargets(a, () => [angel]);
    destroy(game, launderer);
    expect([...seen.offered[0]].sort()).toEqual([angel, bears].sort());
    expect(seen.offered[0]).not.toContain(rogue);
    expect(seen.offered[0]).not.toContain(titan);
    expect(zone(game, angel)).toBe("battlefield");
  });

  it("a 3-power Launderer can't reach a 4-power card", () => {
    const { game, a } = table();
    const launderer = spawn(game, "Body Launderer");
    const angel = toGraveyard(game, "Serra Angel");
    const bears = toGraveyard(game, "Grizzly Bears");
    const courser = toGraveyard(game, "Centaur Courser"); // power 3: equal is fine
    const seen = watchTargets(a, () => [bears]);
    destroy(game, launderer);
    expect([...seen.offered[0]].sort()).toEqual([bears, courser].sort());
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("First Responder", () => {
  it("returns another creature and gets counters equal to its power", () => {
    const { game, a } = table();
    const responder = spawn(game, "First Responder");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1; // power 4 as it leaves
    spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, giant);
    toStep(game, "end");
    settle(game);
    expect(seen.offered).not.toContain(responder);
    expect(zone(game, giant)).toBe("hand");
    expect(counters(game, responder)).toBe(4);
  });

  it("may return nothing", () => {
    const { game, a } = table();
    const responder = spawn(game, "First Responder");
    const giant = spawn(game, "Hill Giant");
    pickPermanents(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, responder)).toBe(0);
  });
});

describe("Celestial Regulator", () => {
  it("taps the creature; with no countered creature, it untaps as normal", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Celestial Regulator");
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("with a creature with a counter, it doesn't untap during its controller's next untap step", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    game.state.objects[mine].counters["+1/+1"] = 1;
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Celestial Regulator");
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("can't target your own creature", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [theirs]);
    enter(game, "Celestial Regulator");
    expect([...seen.offered[0]].sort()).toEqual([theirs, other].sort());
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Obscura Ascendancy", () => {
  it("counts up one mana value at a time", () => {
    const { game } = table();
    const ascendancy = spawn(game, "Obscura Ascendancy");
    lands(game, "Plains", 4);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Savannah Lions"));
    expect(counters(game, ascendancy, "soul")).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Phantom Interference)", A)).toBe(1);
    cast(game, toHand(game, "Elite Vanguard")); // mana value 1 again: no
    expect(counters(game, ascendancy, "soul")).toBe(1);
    cast(game, toHand(game, "Grizzly Bears")); // 2 = 1 + 1
    expect(counters(game, ascendancy, "soul")).toBe(2);
    expect(tokensNamed(game, "Spirit Token (Phantom Interference)", A)).toBe(2);
  });

  it("checks again on resolution: two 1-drops in a row make one Spirit", () => {
    const { game } = table();
    const ascendancy = spawn(game, "Obscura Ascendancy");
    lands(game, "Island", 2);
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    cast(game, toHand(game, "Opt"), { settle: false });
    cast(game, toHand(game, "Opt"), { settle: false });
    settle(game);
    expect(counters(game, ascendancy, "soul")).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Phantom Interference)", A)).toBe(1);
  });

  it("with five soul counters, Spirits you control get +3/+3", () => {
    const { game } = table();
    const ascendancy = spawn(game, "Obscura Ascendancy");
    const spirit = spawn(game, "Spirit Token (Phantom Interference)");
    const theirs = spawn(game, "Spirit Token (Phantom Interference)", B);
    game.state.objects[ascendancy].counters.soul = 4;
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    game.state.objects[ascendancy].counters.soul = 5;
    expect(pt(game, spirit)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kitt Kanto, Mayhem Diva", () => {
  it("makes a Citizen as it enters", () => {
    const { game } = table();
    enter(game, "Kitt Kanto, Mayhem Diva");
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
  });

  it("on an opponent's turn, taps two of yours to pump, trample and goad that player's creature", () => {
    const { game, a } = table({ step: "end" });
    const kitt = spawn(game, "Kitt Kanto, Mayhem Diva");
    const citizen = spawn(game, "Citizen Token");
    spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    a.chooseModesFn = (view) => (activePlayerOf(view.state) === B ? [0] : []);
    pickPermanents(a, kitt, citizen);
    const seen = watchTargets(a, () => [giant]);
    toStep(game, "begin-combat", B);
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(game.state.objects[kitt].tapped).toBe(true);
    expect(game.state.objects[citizen].tapped).toBe(true);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, giant).has("trample")).toBe(true);
    expect(goadersOf(game.state, game.registry, giant)).toContain(A);
  });

  it("isn't offered without two untapped creatures", () => {
    const { game, a } = table({ step: "end" });
    spawn(game, "Kitt Kanto, Mayhem Diva");
    const giant = spawn(game, "Hill Giant", B);
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    toStep(game, "begin-combat", B);
    settle(game);
    expect(asked).toBe(false);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Vivien on the Hunt", () => {
  it("+2: sacrifice a creature to fetch one with mana value one higher", () => {
    const { game, a } = table();
    const vivien = spawn(game, "Vivien on the Hunt");
    game.state.objects[vivien].counters.loyalty = 4;
    const bears = spawn(game, "Grizzly Bears");
    const courser = toLibrary(game, "Centaur Courser");
    toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    const seen = pickFromZone(a, courser);
    loyalty(game, vivien, 2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(seen.offered).toEqual([courser]);
    expect(zone(game, courser)).toBe("battlefield");
    expect(counters(game, vivien, "loyalty")).toBe(6);
  });

  it("+2 without sacrificing does nothing", () => {
    const { game, a } = table();
    const vivien = spawn(game, "Vivien on the Hunt");
    game.state.objects[vivien].counters.loyalty = 4;
    const bears = spawn(game, "Grizzly Bears");
    const courser = toLibrary(game, "Centaur Courser");
    pickModes(a);
    loyalty(game, vivien, 2);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, courser)).toBe("library");
  });

  it("+1: mill five, any number of the creature cards milled go to hand", () => {
    const { game, a } = table();
    const vivien = spawn(game, "Vivien on the Hunt");
    game.state.objects[vivien].counters.loyalty = 4;
    const old = toGraveyard(game, "Serra Angel");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Forest");
    toLibrary(game, "Forest");
    const seen = pickFromZone(a, bears, giant);
    loyalty(game, vivien, 1);
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(seen.offered).not.toContain(old);
    expect(hand(game)).toContain(bears);
    expect(hand(game)).toContain(giant);
    expect(graveyard(game).length).toBe(4); // three Forests and the old Angel
  });

  it("−1: a 4/4 green Rhino Warrior", () => {
    const { game } = table();
    const vivien = spawn(game, "Vivien on the Hunt");
    game.state.objects[vivien].counters.loyalty = 4;
    loyalty(game, vivien, -1);
    const [rhino] = named(game, "Rhino Warrior Token", A);
    expect(pt(game, rhino)).toEqual({ power: 4, toughness: 4 });
  });
});
