/**
 * Amonkhet, group M: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
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
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const emptyHand = (game: ReturnType<typeof table>["game"], player: PlayerId = A): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "graveyard");
};

describe("Liliana, Death Wielder", () => {
  it("−3 targets only a creature with a -1/-1 counter on it", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, Death Wielder");
    const clean = spawn(game, "Grizzly Bears", B);
    const marked = spawn(game, "Hill Giant", B);
    game.state.objects[marked].counters["-1/-1"] = 1;
    expect(() => loyalty(game, liliana, -3, { targets: [ref(clean)] })).toThrow();
    loyalty(game, liliana, -3, { targets: [ref(marked)] });
    expect(zone(game, marked)).toBe("graveyard");
    expect(zone(game, clean)).toBe("battlefield");
  });

  it("−10 returns every creature card from your graveyard", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, Death Wielder");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const island = toGraveyard(game, "Island");
    loyalty(game, liliana, -10, { atLeast: 10 });
    expect([zone(game, bears), zone(game, giant), zone(game, island)]).toEqual(["battlefield", "battlefield", "graveyard"]);
  });
});

describe("Liliana's Influence", () => {
  it("puts a counter only on creatures you don't control, and may fetch Liliana from the graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const liliana = toGraveyard(game, "Liliana, Death Wielder");
    // Yes to the search, then its graveyard-only mode.
    let asked = 0;
    a.chooseModesFn = () => (++asked === 1 ? [0] : [2]);
    pickFromZone(a, liliana);
    cast(game, toHand(game, "Liliana's Influence"));
    expect([counters(game, mine, "-1/-1"), counters(game, theirs, "-1/-1")]).toEqual([0, 1]);
    expect(zone(game, liliana)).toBe("hand");
  });
});

describe("Hazoret the Fervent", () => {
  it("can't attack with two or more cards in hand, and pings each opponent for a discard", () => {
    const { game } = table({ players: 3 });
    const hazoret = spawn(game, "Hazoret the Fervent");
    expect(game.characteristics(hazoret).restrictions.has("cant-attack")).toBe(true);
    expect(game.characteristics(hazoret).restrictions.has("cant-block")).toBe(true);
    lands(game, "Mountain", 3);
    const before = hand(game).length;
    activate(game, hazoret);
    expect(hand(game).length).toBe(before - 1);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 18, 18]);
  });

  it("attacks with one card in hand", () => {
    const { game, a } = table();
    const hazoret = spawn(game, "Hazoret the Fervent");
    emptyHand(game);
    toHand(game, "Island");
    attack(game, a, [hazoret]);
    expect(life(game, B)).toBe(15);
  });
});

describe("Neheb, the Worthy", () => {
  it("other Minotaurs have first strike; Minotaurs get +2/+0 only with one or fewer cards in hand", () => {
    const { game } = table();
    const neheb = spawn(game, "Neheb, the Worthy");
    const minotaur = spawn(game, "Marauding Boneslasher");
    expect(keywords(game, minotaur).has("first-strike")).toBe(true);
    expect(pt(game, neheb).power).toBe(2);
    emptyHand(game);
    toHand(game, "Island");
    expect(pt(game, neheb).power).toBe(4);
    expect(pt(game, minotaur).power).toBe(5);
  });

  it("combat damage to a player makes each player discard a card", () => {
    const { game, a } = table();
    const neheb = spawn(game, "Neheb, the Worthy");
    const [mine, theirs] = [hand(game, A).length, hand(game, B).length];
    attack(game, a, [neheb]);
    expect([hand(game, A).length, hand(game, B).length]).toEqual([mine - 1, theirs - 1]);
  });
});

describe("Bone Picker", () => {
  it("costs {3} less once a creature died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const picker = toHand(game, "Bone Picker");
    expect(() => cast(game, picker)).toThrow();
    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, picker);
    expect(zone(game, picker)).toBe("battlefield");
  });
});

describe("Destined // Lead", () => {
  it("Destined gives +1/+0 and indestructible; Lead is cast from the graveyard and exiled", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Destined // Lead");
    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(zone(game, card)).toBe("graveyard");
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(bears)] });
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Defiant Greatmaw", () => {
  it("counters you put on it remove a -1/-1 counter from another creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["-1/-1"] = 1;
    let asked = 0;
    let greatmaw: ObjectId | undefined;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(asked === 1 ? (greatmaw as ObjectId) : bears)];
    };
    greatmaw = game.debugSpawn("Defiant Greatmaw", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil(quiet);
    expect(counters(game, greatmaw, "-1/-1")).toBe(2);
    expect(counters(game, bears, "-1/-1")).toBe(0);
  });
});

describe("Sacred Excavation", () => {
  it("returns up to two cards with cycling, landcycling included, but not one without", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const haze = toGraveyard(game, "Haze of Pollen");
    const landcycler = toGraveyard(game, "Absorb Vis");
    const bears = toGraveyard(game, "Grizzly Bears");
    const card = toHand(game, "Sacred Excavation");
    expect(() => cast(game, card, { targets: [ref(bears), null] })).toThrow();
    cast(game, card, { targets: [ref(haze), ref(landcycler)] });
    expect([zone(game, haze), zone(game, landcycler)]).toEqual(["hand", "hand"]);
  });
});

describe("Ahn-Crop Champion", () => {
  it("exerted, untaps all other creatures you control, attackers included", () => {
    const { game, a } = table();
    const champion = spawn(game, "Ahn-Crop Champion");
    const bears = spawn(game, "Grizzly Bears");
    const tapped = spawn(game, "Hill Giant", A, { tapped: true });
    pickModes(a, 0);
    attack(game, a, [champion, bears]);
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[champion].tapped).toBe(true);
    expect([game.state.objects[bears].tapped, game.state.objects[tapped].tapped]).toEqual([false, false]);
  });
});

describe("Trial of Ambition", () => {
  it("target opponent sacrifices a creature, and a Cartouche returns it to hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const trial = enter(game, "Trial of Ambition");
    expect(zone(game, bears)).toBe("graveyard");
    enter(game, "Cartouche of Ambition");
    expect(zone(game, trial)).toBe("hand");
  });
});

describe("Trial of Solidarity", () => {
  it("pumps the creatures you control as it resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Trial of Solidarity");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Zenith Seeker", () => {
  it("cycling a card gives target creature flying", () => {
    const { game, a } = table();
    spawn(game, "Zenith Seeker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    pickTargets(a, bears);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Haze of Pollen") });
    game.advanceUntil(quiet);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Tah-Crop Elite", () => {
  it("exerted, creatures you control get +1/+1", () => {
    const { game, a } = table();
    const elite = spawn(game, "Tah-Crop Elite");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [elite]);
    expect(life(game, B)).toBe(17);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Trueheart Twins", () => {
  it("exerting another creature gives creatures you control +1/+0", () => {
    const { game, a } = table();
    spawn(game, "Trueheart Twins");
    const scrapper = spawn(game, "Khenra Scrapper");
    pickModes(a, 0);
    attack(game, a, [scrapper]);
    // 2 base, +2 from its own exert, +1 from the Twins.
    expect(life(game, B)).toBe(15);
  });
});

describe("Rhet-Crop Spearmaster", () => {
  it("exerted, gets +1/+0 and first strike", () => {
    const { game, a } = table();
    const spearmaster = spawn(game, "Rhet-Crop Spearmaster");
    pickModes(a, 0);
    attack(game, a, [spearmaster]);
    expect(life(game, B)).toBe(16);
    expect(keywords(game, spearmaster).has("first-strike")).toBe(true);
  });
});

describe("Kozilek, Butcher of Truth", () => {
  it("dying, its owner shuffles their graveyard into their library", () => {
    const { game } = table();
    const kozilek = spawn(game, "Kozilek, Butcher of Truth");
    const bears = toGraveyard(game, "Grizzly Bears");
    destroy(game, kozilek);
    expect(graveyard(game, A)).toEqual([]);
    expect([zone(game, kozilek), zone(game, bears)]).toEqual(["library", "library"]);
  });

  it("drawing four as it's cast", () => {
    const { game } = table();
    lands(game, "Wastes", 10);
    const before = hand(game).length;
    cast(game, toHand(game, "Kozilek, Butcher of Truth"));
    expect(hand(game).length).toBe(before + 4);
  });
});
