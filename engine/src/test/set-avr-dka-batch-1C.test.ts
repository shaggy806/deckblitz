import { describe, expect, it } from "vitest";
import {
  A,
  B,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Drogskol Captain", () => {
  it("other Spirits get +1/+1 and hexproof; the Captain itself doesn't", () => {
    const { game } = table();
    const captain = spawn(game, "Drogskol Captain");
    const spirit = spawn(game, "Spirit Token");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, spirit).has("hexproof")).toBe(true);
    expect(pt(game, captain)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, captain).has("hexproof")).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Requiem Angel", () => {
  it("a non-Spirit creature of yours dying makes a Spirit; a Spirit dying doesn't", () => {
    const { game } = table();
    spawn(game, "Requiem Angel");
    const bears = spawn(game, "Grizzly Bears");
    const spirit = spawn(game, "Spirit Token");
    lands(game, "Mountain", 2);
    const before = tokensNamed(game, "Spirit Token", A);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(before + 1);
    const spirits = named(game, "Spirit Token", A).length;
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(spirit)] });
    expect(zone(game, spirit)).not.toBe("battlefield");
    expect(named(game, "Spirit Token", A).length).toBe(spirits - 1);
  });
});

describe("Increasing Savagery", () => {
  it("five counters from hand, ten when flashed back", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 11);
    const card = toHand(game, "Increasing Savagery");
    cast(game, card, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(5);
    expect(zone(game, card)).toBe("graveyard");
    cast(game, card, { targets: [ref(bears)], via: "flashback" });
    expect(counters(game, bears)).toBe(15);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Feed the Pack", () => {
  it("sacrificing a nontoken creature at your end step makes Wolves equal to its toughness", () => {
    const { game, a } = table();
    spawn(game, "Feed the Pack");
    const spider = spawn(game, "Giant Spider");
    pickModes(a, 0);
    pickPermanents(a, spider);
    a.chooseSacrificesFn = () => [spider];
    toStep(game, "end");
    settle(game);
    expect(zone(game, spider)).toBe("graveyard");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(4);
  });
});

describe("Mondronen Shaman // Tovolar's Magehunter", () => {
  it("transforms after a turn with no spells, then burns an opponent who casts a spell", () => {
    const { game } = table();
    const shaman = spawn(game, "Mondronen Shaman");
    nextTurn(game);
    expect(game.state.objects[shaman].face).toBe(1);
    expect(pt(game, shaman)).toEqual({ power: 5, toughness: 5 });
    lands(game, "Swamp", 4, B);
    cast(game, toHand(game, "Mental Agony", B), { player: B, targets: [ref(A)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(18);
  });
});

describe("Archangel's Light", () => {
  it("gains 2 life per card in your graveyard, then shuffles it in (not itself)", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Forest");
    lands(game, "Plains", 8);
    const light = toHand(game, "Archangel's Light");
    cast(game, light);
    expect(life(game)).toBe(26);
    expect(graveyard(game)).toEqual([light]);
  });
});

describe("Demonlord of Ashmouth", () => {
  it("is exiled with no other creature to sacrifice", () => {
    const { game } = table();
    const demon = enter(game, "Demonlord of Ashmouth");
    expect(zone(game, demon)).toBe("exile");
  });

  it("stays when you sacrifice another creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickPermanents(a, bears);
    a.chooseSacrificesFn = () => [bears];
    const demon = enter(game, "Demonlord of Ashmouth");
    settle(game);
    expect(zone(game, demon)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Lair Delve", () => {
  it("puts the creature into hand and the non-creature non-land on the bottom", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Lair Delve"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bolt)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(bolt);
  });
});

describe("Undead Executioner", () => {
  it("dying, may give target creature -2/-2", () => {
    const { game, a } = table();
    const exec = spawn(game, "Undead Executioner");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(exec)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Mad Prophet", () => {
  it("{T}, discard a card: draw a card", () => {
    const { game } = table();
    const prophet = spawn(game, "Mad Prophet");
    toHand(game, "Forest");
    const before = hand(game).length;
    expect(named(game, "Mad Prophet", A)).toEqual([prophet]);
    game.dispatch({ type: "activate-ability", player: A, source: prophet, abilityIndex: 0, targets: [] });
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(1);
  });
});
