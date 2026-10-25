/**
 * Shadows over Innistrad, group E: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
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
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const faceName = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

/** Artifact, creature, instant and land: delirium. */
function delirium(game: Game): void {
  toGraveyard(game, "Sol Ring");
  toGraveyard(game, "Grizzly Bears");
  toGraveyard(game, "Shock");
  toGraveyard(game, "Wastes");
}

describe("Hanweir Militia Captain // Westvale Cult Leader", () => {
  it("transforms at upkeep with four creatures, then counts them and makes a Human Cleric at end step", () => {
    const { game } = table();
    const captain = spawn(game, "Hanweir Militia Captain");
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(faceName(game, captain)).toBe("Westvale Cult Leader");
    expect(pt(game, captain)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Human Cleric Token", A)).toBe(1);
    expect(pt(game, captain)).toEqual({ power: 5, toughness: 5 });
  });

  it("doesn't transform with only three creatures", () => {
    const { game } = table();
    const captain = spawn(game, "Hanweir Militia Captain");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(faceName(game, captain)).toBe("Hanweir Militia Captain");
  });
});

describe("Manic Scribe", () => {
  it("mills each opponent 3 as it enters, and the opponent 3 more on their upkeep with delirium", () => {
    const { game } = table();
    delirium(game);
    enter(game, "Manic Scribe");
    expect(graveyard(game, B)).toHaveLength(3);
    nextTurn(game);
    expect(graveyard(game, B)).toHaveLength(6);
  });

  it("no upkeep mill without delirium", () => {
    const { game } = table();
    enter(game, "Manic Scribe");
    nextTurn(game);
    expect(graveyard(game, B)).toHaveLength(3);
  });
});

describe("Ongoing Investigation", () => {
  it("investigates on combat damage, and its activation investigates and gains 2 life", () => {
    const { game, a } = table();
    const investigation = spawn(game, "Ongoing Investigation");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const dead = toGraveyard(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    activate(game, investigation, 0);
    expect(zone(game, dead)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(life(game)).toBe(22);
  });
});

describe("Descend upon the Sinful", () => {
  it("exiles every creature and makes a 4/4 Angel with delirium", () => {
    const { game } = table();
    delirium(game);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Descend upon the Sinful"));
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
  });

  it("no Angel without delirium", () => {
    const { game } = table();
    const theirs = spawn(game, "Serra Angel", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Descend upon the Sinful"));
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(0);
  });
});

describe("Prized Amalgam", () => {
  it("returns tapped at the next end step after a creature enters from your graveyard", () => {
    const { game } = table();
    const amalgam = toGraveyard(game, "Prized Amalgam");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Zombify"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, amalgam)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, amalgam)).toBe("battlefield");
    expect(game.state.objects[amalgam].tapped).toBe(true);
  });

  it("stays put for a creature cast from your hand", () => {
    const { game } = table();
    const amalgam = toGraveyard(game, "Prized Amalgam");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    toStep(game, "end");
    settle(game);
    expect(zone(game, amalgam)).toBe("graveyard");
  });
});

describe("Corrupted Grafstone", () => {
  it("makes mana of a colour among cards in your graveyard", () => {
    const { game } = table();
    spawn(game, "Corrupted Grafstone");
    toGraveyard(game, "Shock");
    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("makes nothing from a colourless graveyard", () => {
    const { game } = table();
    spawn(game, "Corrupted Grafstone");
    toGraveyard(game, "Sol Ring");
    nextTurn(game);
    nextTurn(game);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] })).toThrow();
  });
});

describe("Pieces of the Puzzle", () => {
  it("puts up to two instants and sorceries into your hand and the rest into your graveyard", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const bolt = toLibrary(game, "Lightning Bolt");
    const opt = toLibrary(game, "Opt");
    const shock = toLibrary(game, "Shock");
    const top = toLibrary(game, "Wastes");
    const seen = pickFromZone(a, opt, shock);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Pieces of the Puzzle"));
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(top);
    expect(hand(game)).toContain(opt);
    expect(hand(game)).toContain(shock);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Harvest Hand // Scrounged Scythe", () => {
  it("returns as the Scythe when it dies, which gives a Human +1/+1 and menace", () => {
    const { game } = table();
    const harvest = spawn(game, "Harvest Hand");
    destroy(game, harvest);
    toStep(game, "postcombat-main");
    expect(zone(game, harvest)).toBe("battlefield");
    expect(faceName(game, harvest)).toBe("Scrounged Scythe");
    const human = spawn(game, "Hanweir Militia Captain");
    lands(game, "Wastes", 2);
    activate(game, harvest, 0, { targets: [ref(human)] });
    expect(pt(game, human)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, human).has("menace")).toBe(true);
  });

  it("gives a non-Human only +1/+1", () => {
    const { game } = table();
    const harvest = spawn(game, "Harvest Hand");
    destroy(game, harvest);
    toStep(game, "postcombat-main");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, harvest, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});

describe("Pious Evangel // Wayward Disciple", () => {
  it("gains 1 per creature entering, transforms by sacrificing another permanent, then drains on deaths", () => {
    const { game, a } = table();
    const evangel = spawn(game, "Pious Evangel");
    const bears = enter(game, "Grizzly Bears");
    expect(life(game)).toBe(21);
    const ring = spawn(game, "Sol Ring");
    lands(game, "Wastes", 2);
    const sacrificing = (what: ObjectId) =>
      ({ type: "activate-ability", player: A, source: evangel, abilityIndex: 0, targets: [], sacrifice: what }) as const;
    expect(game.canDispatch(sacrificing(evangel))).not.toBeNull();
    game.dispatch(sacrificing(ring));
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(faceName(game, evangel)).toBe("Wayward Disciple");
    pickTargets(a, B);
    destroy(game, bears);
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(22);
  });
});

describe("Geistblast", () => {
  it("exiles itself from the graveyard to copy an instant you control", () => {
    const { game, a } = table();
    const geistblast = toGraveyard(game, "Geistblast");
    lands(game, "Mountain", 1);
    lands(game, "Island", 3);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    pickTargets(a, B);
    activate(game, geistblast, 0, { targets: [ref(shock)] });
    expect(zone(game, geistblast)).toBe("exile");
    expect(life(game, B)).toBe(16);
  });
});

describe("Aberrant Researcher // Perfected Form", () => {
  it("transforms when the upkeep mill hits an instant", () => {
    const { game } = table();
    const researcher = spawn(game, "Aberrant Researcher");
    toLibrary(game, "Opt");
    toStep(game, "upkeep");
    settle(game);
    expect(faceName(game, researcher)).toBe("Perfected Form");
    expect(pt(game, researcher)).toEqual({ power: 5, toughness: 4 });
  });

  it("stays a Human Insect when it mills a land", () => {
    const { game } = table();
    const researcher = spawn(game, "Aberrant Researcher");
    toStep(game, "upkeep");
    settle(game);
    expect(faceName(game, researcher)).toBe("Aberrant Researcher");
  });
});

describe("Militant Inquisitor", () => {
  it("gets +1/+0 for each Equipment you control, attached or not", () => {
    const { game } = table();
    const inquisitor = spawn(game, "Militant Inquisitor");
    spawn(game, "Bonesplitter");
    spawn(game, "Bonesplitter");
    spawn(game, "Bonesplitter", B);
    expect(pt(game, inquisitor)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Uninvited Geist // Unimpeded Trespasser", () => {
  it("transforms after dealing combat damage to a player", () => {
    const { game, a } = table();
    const geist = spawn(game, "Uninvited Geist");
    attack(game, a, [geist]);
    expect(life(game, B)).toBe(18);
    expect(faceName(game, geist)).toBe("Unimpeded Trespasser");
  });
});

describe("Kindly Stranger // Demon-Possessed Witch", () => {
  it("transforms with delirium and may destroy target creature", () => {
    const { game, a } = table();
    delirium(game);
    const stranger = spawn(game, "Kindly Stranger");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    pickTargets(a, bears);
    pickModes(a, 0);
    activate(game, stranger, 0);
    expect(faceName(game, stranger)).toBe("Demon-Possessed Witch");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't be activated without delirium", () => {
    const { game } = table();
    const stranger = spawn(game, "Kindly Stranger");
    lands(game, "Swamp", 3);
    expect(() => activate(game, stranger, 0)).toThrow();
  });
});

describe("Avacynian Missionaries // Lunarch Inquisitors", () => {
  it("transforms at end step while equipped and exiles a creature until it leaves", () => {
    const { game, a } = table();
    const missionaries = spawn(game, "Avacynian Missionaries");
    const splitter = spawn(game, "Bonesplitter");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    activate(game, splitter, 0, { targets: [ref(missionaries)] });
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(faceName(game, missionaries)).toBe("Lunarch Inquisitors");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, missionaries);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("doesn't transform unequipped", () => {
    const { game } = table();
    const missionaries = spawn(game, "Avacynian Missionaries");
    spawn(game, "Bonesplitter");
    toStep(game, "end");
    settle(game);
    expect(faceName(game, missionaries)).toBe("Avacynian Missionaries");
  });
});

describe("Intrepid Provisioner", () => {
  it("pumps another Human you control", () => {
    const { game, a } = table();
    const human = spawn(game, "Hanweir Militia Captain");
    pickTargets(a, human);
    enter(game, "Intrepid Provisioner");
    expect(pt(game, human)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Stallion of Ashmouth", () => {
  it("pumps only with delirium", () => {
    const { game } = table();
    const stallion = spawn(game, "Stallion of Ashmouth");
    lands(game, "Swamp", 2);
    expect(() => activate(game, stallion, 0)).toThrow();
    delirium(game);
    activate(game, stallion, 0);
    expect(pt(game, stallion)).toEqual({ power: 4, toughness: 4 });
  });
});
