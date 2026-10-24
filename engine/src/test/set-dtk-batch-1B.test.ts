/**
 * Dragons of Tarkir, group B: the clauses most likely to be wrong — Foul
 * Renewal's X read off the card it returned, Corpseweft's "one or more"
 * exile cost and its X/X, Illusory Gains's control that follows the Aura,
 * Ojutai Exemplars's modes, Sight of the Scalelords's toughness gate, Avatar
 * of the Resolute's count, the megamorph Dragons' face-up trigger, Vulturous
 * Aven's exploit, formidable activation, Ire Shaman's impulse and Rending
 * Volley's colour gate.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};

describe("Foul Renewal", () => {
  it("returns the creature card and gives -X/-X by that card's toughness", () => {
    const { game } = table();
    const wurm = toGraveyard(game, "Craw Wurm"); // 6/4
    const giant = spawn(game, "Hill Giant", B); // 3/3
    const exemplars = spawn(game, "Ojutai Exemplars", B); // 4/4
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Foul Renewal"), { targets: [ref(wurm), ref(exemplars)] });
    expect(zone(game, wurm)).toBe("hand");
    expect(zone(game, exemplars)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("with the toughness 2 card returned, the creature gets -2/-2", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const exemplars = spawn(game, "Ojutai Exemplars", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Foul Renewal"), { targets: [ref(bears), ref(exemplars)] });
    expect(zone(game, bears)).toBe("hand");
    expect(pt(game, exemplars)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Corpseweft", () => {
  it("exiles X creature cards as the cost and makes a tapped 2X/2X Zombie Horror", () => {
    const { game } = table();
    const weft = spawn(game, "Corpseweft");
    const bears = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
    const land = toGraveyard(game, "Wastes");
    lands(game, "Swamp", 2);
    game.dispatch({ type: "activate-ability", player: A, source: weft, abilityIndex: 0, targets: [], xValue: 2 });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-from-zone");
    if (awaiting?.kind === "choose-from-zone") expect(awaiting.eligible).not.toContain(land);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bears[0], bears[2]] });
    settle(game);
    expect(zone(game, bears[0])).toBe("exile");
    expect(zone(game, bears[2])).toBe("exile");
    expect(zone(game, bears[1])).toBe("graveyard");
    const [horror] = named(game, "Zombie Horror Token", A);
    expect(horror).toBeDefined();
    expect(pt(game, horror)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[horror].tapped).toBe(true);
  });

  it("can't be activated exiling no cards", () => {
    const { game } = table();
    const weft = spawn(game, "Corpseweft");
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: weft, abilityIndex: 0, targets: [], xValue: 0 }),
    ).not.toBeNull();
  });
});

describe("Illusory Gains", () => {
  it("steals the creature it enchants, then moves to an opponent's entering creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const gains = toHand(game, "Illusory Gains");
    cast(game, gains, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    const giant = enter(game, "Hill Giant", B);
    expect(game.state.objects[gains].attachedTo).toBe(giant);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Ojutai Exemplars", () => {
  it("blinks itself back tapped on a noncreature spell", () => {
    const { game, a } = table();
    spawn(game, "Ojutai Exemplars");
    lands(game, "Wastes", 2);
    pickModes(a, 2);
    cast(game, toHand(game, "Vial of Dragonfire"));
    const [exemplars] = named(game, "Ojutai Exemplars", A);
    expect(zone(game, exemplars)).toBe("battlefield");
    expect(game.state.objects[exemplars].tapped).toBe(true);
  });

  it("gains first strike and lifelink, or taps a target creature", () => {
    const { game, a } = table();
    const exemplars = spawn(game, "Ojutai Exemplars");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    pickModes(a, 1);
    cast(game, toHand(game, "Vial of Dragonfire"));
    expect(keywords(game, exemplars).has("first-strike")).toBe(true);
    expect(keywords(game, exemplars).has("lifelink")).toBe(true);
    pickModes(a, 0);
    pickTargets(a, bears);
    cast(game, toHand(game, "Vial of Dragonfire"));
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Sight of the Scalelords", () => {
  it("pumps only creatures with toughness 4 or greater at the beginning of combat", () => {
    const { game } = table();
    spawn(game, "Sight of the Scalelords");
    const exemplars = spawn(game, "Ojutai Exemplars");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Craw Wurm", B);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, exemplars)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, exemplars).has("vigilance")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    expect(pt(game, theirs)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Avatar of the Resolute", () => {
  it("enters with a counter for each other creature you control with a +1/+1 counter", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    for (const id of [one, two, theirs]) game.state.objects[id].counters["+1/+1"] = 1;
    lands(game, "Forest", 2);
    const avatar = toHand(game, "Avatar of the Resolute");
    cast(game, avatar);
    expect(counters(game, avatar)).toBe(2);
  });
});

describe("the megamorph Dragons", () => {
  it("Acid-Spewer Dragon turned face up puts a counter on each other Dragon you control", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    lands(game, "Swamp", 7);
    const acid = toHand(game, "Acid-Spewer Dragon");
    cast(game, acid, { via: "face-down" });
    const other = spawn(game, "Stormwing Dragon");
    const theirs = spawn(game, "Shieldhide Dragon", B);
    const bears = spawn(game, "Grizzly Bears");
    turnUp(game, acid);
    expect(counters(game, acid)).toBe(1); // megamorph's own
    expect(counters(game, other)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
    expect(counters(game, bears)).toBe(0);
  });

  it("Ire Shaman turned face up exiles the top card of your library", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    lands(game, "Mountain", 1);
    const shaman = toHand(game, "Ire Shaman");
    cast(game, shaman, { via: "face-down" });
    const exiled = game.state.zones.shared.exile.length;
    turnUp(game, shaman);
    expect(game.state.zones.shared.exile.length).toBe(exiled + 1);
  });
});

describe("Vulturous Aven", () => {
  it("exploiting a creature draws two and loses 2 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const aven = toHand(game, "Vulturous Aven");
    const before = hand(game).length;
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    cast(game, aven);
    expect(graveyard(game)).toContain(bears);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game)).toBe(18);
  });
});

describe("formidable", () => {
  it("Dragon Whisperer makes a Dragon only with total power 8 or greater", () => {
    const { game } = table();
    const whisperer = spawn(game, "Dragon Whisperer");
    lands(game, "Mountain", 6);
    const action = { type: "activate-ability", player: A, source: whisperer, abilityIndex: 2, targets: [] } as Action;
    expect(game.canDispatch(action)).not.toBeNull();
    spawn(game, "Ojutai Exemplars");
    spawn(game, "Hill Giant");
    activate(game, whisperer, 2);
    const [dragon] = named(game, "Dragon Token (Dragonback Assault)", A);
    expect(pt(game, dragon)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, dragon).has("flying")).toBe(true);
  });
});

describe("Rending Volley", () => {
  it("targets only a white or blue creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const exemplars = spawn(game, "Ojutai Exemplars", B);
    lands(game, "Mountain", 1);
    const volley = toHand(game, "Rending Volley");
    expect(() => cast(game, volley, { targets: [ref(bears)] })).toThrow();
    cast(game, volley, { targets: [ref(exemplars)] });
    expect(zone(game, exemplars)).toBe("graveyard");
  });
});
