import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Consign to Dream", () => {
  it("returns a nonred, nongreen permanent to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const drake = spawn(game, "Wind Drake", B);
    cast(game, toHand(game, "Consign to Dream"), { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("hand");
  });

  it("puts a red or green permanent on top of its owner's library instead", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Consign to Dream"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1] === bears || library[0] === bears).toBe(true);
  });
});

describe("Isleback Spawn", () => {
  it("gets +4/+8 only while some library has twenty or fewer cards", () => {
    const { game } = table();
    const spawnId = spawn(game, "Isleback Spawn");
    expect(pt(game, spawnId)).toEqual({ power: 4, toughness: 8 });
    // Bob's library, not Alice's, drops to twenty.
    const library = game.state.zones.perPlayer[B].library as string[];
    library.splice(0, library.length - 20);
    expect(pt(game, spawnId)).toEqual({ power: 8, toughness: 16 });
  });
});

describe("Toil to Renown", () => {
  it("counts each tapped artifact, creature and land you control once", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    spawn(game, "Wastes", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Ornithopter", A, { tapped: true });
    spawn(game, "Grizzly Bears");
    spawn(game, "Wastes", B, { tapped: true });
    spawn(game, "Wastes");
    void forest;
    cast(game, toHand(game, "Toil to Renown"));
    // Forest and Wastes tapped to cast it, plus the tapped Wastes, Bears and
    // Ornithopter (an artifact creature, once).
    expect(life(game)).toBe(25);
  });
});

describe("Sinking Feeling", () => {
  it("keeps the creature tapped, and gives it a {1}, -1/-1 counter untap", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    cast(game, toHand(game, "Sinking Feeling"), { targets: [ref(giant)] });
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[giant].tapped).toBe(true);
    activate(game, giant, 0);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Scarscale Ritual", () => {
  it("puts a -1/-1 counter on a creature you control and draws two", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const giant = spawn(game, "Hill Giant");
    const ritual = toHand(game, "Scarscale Ritual");
    const before = hand(game).length;
    pickPermanents(a, giant);
    cast(game, ritual, { costOption: 0 });
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Sootstoke Kindler", () => {
  it("gives haste only to a black or red creature", () => {
    const { game } = table();
    const kindler = spawn(game, "Sootstoke Kindler");
    const giant = spawn(game, "Hill Giant", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    expect(() => activate(game, kindler, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, kindler, 0, { targets: [ref(giant)] });
    expect(keywords(game, giant).has("haste")).toBe(true);
  });
});

describe("Roughshod Mentor", () => {
  it("gives trample to green creatures you control only", () => {
    const { game } = table();
    spawn(game, "Roughshod Mentor");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, giant).has("trample")).toBe(false);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

describe("Crabapple Cohort and Ashenmoor Cohort", () => {
  it("each gets +1/+1 only with another creature of its colour", () => {
    const { game } = table();
    const crab = spawn(game, "Crabapple Cohort");
    const ash = spawn(game, "Ashenmoor Cohort");
    expect(pt(game, crab)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, ash)).toEqual({ power: 4, toughness: 3 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, crab)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, ash)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Gravelgill Duo", () => {
  it("gets +1/+1 on a blue spell and fear on a black one", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const duo = spawn(game, "Gravelgill Duo");
    cast(game, toHand(game, "Divination"));
    expect(pt(game, duo)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, duo).has("fear")).toBe(false);
    cast(game, toHand(game, "Night's Whisper"));
    expect(keywords(game, duo).has("fear")).toBe(true);
  });
});

describe("Thistledown Duo", () => {
  it("gets +1/+1 on a white spell and flying on a blue one", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const duo = spawn(game, "Thistledown Duo");
    cast(game, toHand(game, "Divination"));
    expect(keywords(game, duo).has("flying")).toBe(true);
    expect(pt(game, duo)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kinscaer Harpoonist", () => {
  it("may have the target creature lose flying until end of turn", () => {
    const { game, a } = table();
    const harpoonist = spawn(game, "Kinscaer Harpoonist");
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    pickModes(a, 0);
    attack(game, a, [harpoonist]);
    expect(keywords(game, angel).has("flying")).toBe(false);
    nextTurn(game);
    expect(keywords(game, angel).has("flying")).toBe(true);
  });
});

describe("Boggart Arsonists", () => {
  it("sacrifices itself to destroy a Plains", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const arsonists = spawn(game, "Boggart Arsonists");
    const plains = spawn(game, "Plains", B);
    const wastes = spawn(game, "Wastes", B);
    expect(() => activate(game, arsonists, 0, { targets: [ref(wastes)] })).toThrow();
    activate(game, arsonists, 0, { targets: [ref(plains)] });
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, arsonists)).toBe("graveyard");
  });
});
