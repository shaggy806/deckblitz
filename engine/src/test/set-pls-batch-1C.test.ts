import { describe, expect, it } from "vitest";
import {
  A,
  B,
  blockOffer,
  cast,
  enter,
  keywords,
  lands,
  life,
  pickFromZone,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Crosis's Catacombs", () => {
  it("returns a non-Lair land you choose and stays", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const otherLair = spawn(game, "Darigaaz's Caldera");
    const seen = pickPermanents(a, forest);
    const lair = enter(game, "Crosis's Catacombs");
    expect(seen.offered).toEqual([forest]);
    expect(seen.offered).not.toContain(otherLair);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, lair)).toBe("battlefield");
  });

  it("is sacrificed when no land is returned", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    pickPermanents(a);
    const lair = enter(game, "Crosis's Catacombs");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, lair)).toBe("graveyard");
  });
});

describe("Magnigoth Treefolk", () => {
  it("has landwalk only for the basic land types you control", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const tree = spawn(game, "Magnigoth Treefolk");
    const kw = keywords(game, tree);
    expect(kw.has("islandwalk")).toBe(true);
    expect(kw.has("swampwalk")).toBe(true);
    expect(kw.has("forestwalk")).toBe(false);
    expect(kw.has("plainswalk")).toBe(false);
  });
});

describe("March of Souls", () => {
  it("gives each controller a Spirit per creature of theirs destroyed", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Savannah Lions", B)];
    cast(game, toHand(game, "March of Souls"));
    expect(zone(game, mine)).toBe("graveyard");
    for (const id of theirs) expect(zone(game, id)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    expect(tokensNamed(game, "Spirit Token", B)).toBe(2);
  });
});

describe("Horned Kavu", () => {
  it("offers only red or green creatures you control, itself included", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Raging Goblin");
    const lions = spawn(game, "Savannah Lions");
    const seen = pickPermanents(a, goblin);
    const kavu = enter(game, "Horned Kavu");
    expect([...seen.offered].sort()).toEqual([goblin, kavu].sort());
    expect(seen.offered).not.toContain(lions);
    expect(zone(game, goblin)).toBe("hand");
    expect(zone(game, kavu)).toBe("battlefield");
  });
});

describe("Hobble", () => {
  it("stops a black enchanted creature from blocking, not a white one", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const corpse = spawn(game, "Walking Corpse", B);
    const lions = spawn(game, "Savannah Lions", B);
    cast(game, toHand(game, "Hobble"), { targets: [ref(corpse)] });
    cast(game, toHand(game, "Hobble"), { targets: [ref(lions)] });
    const attacker = spawn(game, "Craw Wurm");
    const offer = blockOffer(game, a, [attacker]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(lions);
    expect(blockers).not.toContain(corpse);
  });
});

describe("Honorable Scout", () => {
  it("gains 2 life per black or red creature the opponent controls", () => {
    const { game, a } = table();
    spawn(game, "Walking Corpse", B);
    spawn(game, "Raging Goblin", B);
    spawn(game, "Savannah Lions", B);
    const before = life(game);
    watchTargets(a, () => [B]);
    enter(game, "Honorable Scout");
    expect(life(game)).toBe(before + 4);
  });
});

describe("Surprise Deployment", () => {
  it("can't be cast outside combat", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    expect(() => cast(game, toHand(game, "Surprise Deployment"))).toThrow();
  });

  it("puts a nonwhite creature from hand onto the battlefield and returns it at end step", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const wurm = toHand(game, "Craw Wurm");
    const lions = toHand(game, "Savannah Lions");
    const spell = toHand(game, "Surprise Deployment");
    toStep(game, "begin-combat");
    const seen = pickFromZone(a, wurm);
    cast(game, spell);
    expect(seen.offered).toContain(wurm);
    expect(seen.offered).not.toContain(lions);
    expect(zone(game, wurm)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, wurm)).toBe("hand");
  });
});

describe("Hunting Drake", () => {
  it("can target only red or green creatures", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    const seen = watchTargets(a, () => [goblin]);
    enter(game, "Hunting Drake");
    expect([...seen.offered[0]].sort()).toEqual([goblin, bears].sort());
    expect(seen.offered[0]).not.toContain(lions);
    expect(zone(game, goblin)).toBe("library");
  });
});

describe("Magma Burst", () => {
  it("kicked, sacrifices two lands and deals 3 to each of two targets", () => {
    const { game } = table();
    const mine = lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = life(game, B);
    cast(game, toHand(game, "Magma Burst"), { targets: [ref(bears), ref(B)], kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 3);
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
  });

  it("unkicked, sacrifices nothing and has one target", () => {
    const { game } = table();
    const mine = lands(game, "Mountain", 4);
    const before = life(game, B);
    cast(game, toHand(game, "Magma Burst"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 3);
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(0);
  });
});
