/**
 * "For each player, you choose a permanent that player controls" — a `vote`
 * with `choose` and `about`: the one chooser, one untargeted question per
 * player, then `for-each-voted` acting on all of them at once (rule 101.4).
 * "Each opponent chooses …" is the same with `who` and `own`. Fell Beast's
 * Shriek, Ultimate Magic: Meteor, Krenko's Buzzcrusher, Winnowing; and Ghouls'
 * Night Out, held choices entering as something.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  D,
  attack,
  cast,
  enter,
  graveyard,
  keywords,
  lands,
  named,
  pickModes,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("each opponent chooses", () => {
  it("Fell Beast's Shriek: tapped and goaded, each opponent choosing their own, a hexproof one too", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsOther = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Gladecover Scout", C);
    spawn(game, "Grizzly Bears", A);
    const offers: Record<string, readonly ObjectId[]> = {};
    b.choosePermanentsFn = (_view, eligible) => {
      offers.b = eligible;
      return [bobs];
    };
    c.choosePermanentsFn = (_view, eligible) => {
      offers.c = eligible;
      return [carols];
    };
    d.choosePermanentsFn = () => {
      throw new Error("Dave controls no creature");
    };
    a.choosePermanentsFn = () => {
      throw new Error("not Alice's choice");
    };
    const spell = toHand(game, "Fell Beast's Shriek", A);
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    cast(game, spell);
    expect(new Set(offers.b)).toEqual(new Set([bobs, bobsOther]));
    expect(offers.c).toEqual([carols]);
    expect(game.state.objects[bobs].tapped).toBe(true);
    expect(game.state.objects[carols].tapped).toBe(true);
    expect(game.state.objects[bobsOther].tapped).toBe(false);
    expect(game.state.objects[bobs].goadedBy).toContain(A);
    expect(game.state.objects[carols].goadedBy).toContain(A);
  });
});

describe("for each player, you choose", () => {
  function meteor(foretold: boolean) {
    const t = table({ players: 4 });
    const { game, a } = t;
    const bobsLand = spawn(game, "Forest", B);
    const bobsArtifact = spawn(game, "Sol Ring", B);
    const carolsArtifact = spawn(game, "Sol Ring", C);
    const carolsLand = spawn(game, "Forest", C);
    const mine = spawn(game, "Sol Ring", A);
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = spawn(game, "Colossal Dreadmaw", C);
    const asked: { offered: readonly ObjectId[]; prompt: string | undefined }[] = [];
    a.choosePermanentsFn = (view, eligible) => {
      const awaiting = view.state.awaiting;
      asked.push({ offered: eligible, prompt: awaiting?.kind === "choose-permanents" ? awaiting.prompt : undefined });
      return eligible.includes(bobsLand) ? [bobsLand] : eligible.includes(carolsArtifact) ? [carolsArtifact] : [];
    };
    const spell = toHand(game, "Ultimate Magic: Meteor", A);
    lands(game, "Mountain", 10);
    if (foretold) {
      game.dispatch({ type: "foretell", player: A, card: spell });
      settle(game);
      game.state.objects[spell].foretoldOnTurn = 0;
      lands(game, "Mountain", 2);
      cast(game, spell, { via: "foretell" });
    } else {
      cast(game, spell);
    }
    return { ...t, asked, bobsLand, bobsArtifact, carolsArtifact, carolsLand, mine, wurm, giant };
  }

  it("Ultimate Magic: Meteor: from exile, one artifact or land per opponent, destroyed together", () => {
    const m = meteor(true);
    const { game } = m;
    // Only the opponents', each one's own, named in the question.
    expect(new Set(m.asked[0].offered)).toEqual(new Set([m.bobsLand, m.bobsArtifact]));
    expect(m.asked[0].prompt).toBe("Choose an artifact or land to destroy — Bob's");
    expect(m.asked[1].prompt).toBe("Choose an artifact or land to destroy — Carol's");
    expect(m.asked).toHaveLength(2); // Dave controls neither.
    expect(zone(game, m.wurm)).toBe("graveyard");
    expect(zone(game, m.giant)).toBe("graveyard"); // 7 damage, toughness 6
    expect(zone(game, m.bobsLand)).toBe("graveyard");
    expect(zone(game, m.carolsArtifact)).toBe("graveyard");
    expect(zone(game, m.bobsArtifact)).toBe("battlefield");
    expect(zone(game, m.carolsLand)).toBe("battlefield");
    expect(zone(game, m.mine)).toBe("battlefield");
  });

  it("Ultimate Magic: Meteor: from a hand, only the damage", () => {
    const m = meteor(false);
    expect(m.asked).toEqual([]);
    expect(zone(m.game, m.wurm)).toBe("graveyard");
    expect(zone(m.game, m.bobsLand)).toBe("battlefield");
  });

  it("Krenko's Buzzcrusher: up to one each, then each controller of one destroyed may search, tapped", () => {
    const { game, a, b, c } = table({ players: 3 });
    const mine = spawn(game, "Command Tower", A);
    const bobs = spawn(game, "Command Tower", B);
    const bobsBasic = spawn(game, "Forest", B);
    const carols = spawn(game, "Command Tower", C);
    const bobsFind = toLibrary(game, "Forest", B);
    const offers: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      // Alice declines her own and Carol's.
      return eligible.includes(bobs) ? [bobs] : [];
    };
    pickModes(b, 0);
    pickModes(c, 0);
    pickModes(a, 0);
    b.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toContain(bobsFind);
      return [bobsFind];
    };
    c.chooseFromZoneFn = () => {
      throw new Error("nothing of Carol's was destroyed");
    };
    a.chooseFromZoneFn = () => {
      throw new Error("nothing of Alice's was destroyed");
    };
    enter(game, "Krenko's Buzzcrusher");
    expect(offers).toEqual([[mine], [bobs], [carols]]);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, carols)).toBe("battlefield");
    expect(zone(game, bobsBasic)).toBe("battlefield");
    expect(zone(game, bobsFind)).toBe("battlefield");
    expect(game.state.objects[bobsFind].tapped).toBe(true);
  });

  it("Krenko's Buzzcrusher: an indestructible land isn't destroyed, so there's no search", () => {
    const { game, a, b } = table();
    const darksteel = spawn(game, "Darksteel Citadel", B);
    a.choosePermanentsFn = (_view, eligible) => (eligible.includes(darksteel) ? [darksteel] : []);
    b.chooseFromZoneFn = () => {
      throw new Error("no land of Bob's was destroyed");
    };
    enter(game, "Krenko's Buzzcrusher");
    expect(zone(game, darksteel)).toBe("battlefield");
  });

  it("Winnowing: each keeps the chosen creature and what shares a type with it, all sacrificed at once", () => {
    const { game, a } = table({ players: 3 });
    const elf = spawn(game, "Llanowar Elves", A); // Elf Druid
    const otherDruid = spawn(game, "Fyndhorn Elder", A); // Elf Druid
    const myBears = spawn(game, "Grizzly Bears", A);
    const bobsBears = spawn(game, "Grizzly Bears", B);
    const bobsGiant = spawn(game, "Hill Giant", B);
    const bobsChangeling = spawn(game, "Woodland Changeling", B);
    const carols = spawn(game, "Hill Giant", C);
    const asked: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      asked.push(eligible);
      if (eligible.includes(elf)) return [elf];
      if (eligible.includes(bobsBears)) return [bobsBears];
      return [carols];
    };
    const spell = toHand(game, "Winnowing", A);
    lands(game, "Plains", 6);
    cast(game, spell);
    expect(asked).toHaveLength(3);
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, otherDruid)).toBe("battlefield");
    expect(zone(game, myBears)).toBe("graveyard");
    expect(zone(game, bobsBears)).toBe("battlefield");
    expect(zone(game, bobsGiant)).toBe("graveyard");
    expect(zone(game, bobsChangeling)).toBe("battlefield"); // every creature type (702.73a)
    expect(zone(game, carols)).toBe("battlefield");
    // One event: each one's leaves batch saw the others.
    expect(graveyard(game, B)).toContain(bobsGiant);
  });

  it("Winnowing: a Dave with nothing isn't asked about; the question names whose it is", () => {
    const { game, a } = table({ players: 4 });
    const mine = spawn(game, "Grizzly Bears", A);
    const prompts: (string | undefined)[] = [];
    a.choosePermanentsFn = (view, eligible) => {
      const awaiting = view.state.awaiting;
      prompts.push(awaiting?.kind === "choose-permanents" ? awaiting.prompt : undefined);
      return [eligible[0]];
    };
    const spell = toHand(game, "Winnowing", A);
    lands(game, "Plains", 6);
    cast(game, spell);
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toContain("Alice's");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("held choices entering as something", () => {
  it("Ghouls' Night Out: one a graveyard, together, black Zombies with decayed under your control", () => {
    const { game, a } = table({ players: 4 });
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = toGraveyard(game, "Hill Giant", B);
    const carols = toGraveyard(game, "Craw Wurm", C);
    toGraveyard(game, "Forest", D);
    const picks = new Map<ObjectId, ObjectId>([[mine, mine], [bobs, bobs], [carols, carols]]);
    const zonesSeen: string[][] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      zonesSeen.push([mine, bobs, carols].map((id) => zone(game, id)));
      const pick = eligible.find((id) => picks.has(id));
      return pick === undefined ? [] : [pick];
    };
    const spell = toHand(game, "Ghouls' Night Out", A);
    lands(game, "Swamp", 5);
    const before = game.state.eventLog.length;
    cast(game, spell);
    // Nothing enters until the last has been chosen.
    expect(zonesSeen.at(-1)).toEqual(["graveyard", "graveyard", "graveyard"]);
    for (const id of [mine, bobs, carols]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].controller).toBe(A);
      const c = computeCharacteristics(game.state, registryOf(game), id);
      expect(c.colors).toContain("B");
      expect(subtypes(game, id)).toContain("Zombie");
      expect(keywords(game, id).has("decayed")).toBe(true);
    }
    // Hill Giant keeps its own type and colour.
    expect(subtypes(game, bobs)).toContain("Giant");
    expect(computeCharacteristics(game.state, registryOf(game), bobs).colors).toContain("R");
    // Together: one batch leaving the graveyards, seen once.
    expect(game.state.eventLog.slice(before).filter((e) => e.type === "cards-left-graveyard")).toHaveLength(1);
  });

  it("Ghouls' Night Out: decayed, it can't block and is sacrificed at end of combat if it attacks", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", A);
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : []);
    const spell = toHand(game, "Ghouls' Night Out", A);
    lands(game, "Swamp", 5);
    cast(game, spell);
    game.state.objects[bears].summoningSick = false;
    attack(game, a, [bears]);
    toStep(game, "postcombat-main", A);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", A as PlayerId)).toEqual([]);
  });
});
