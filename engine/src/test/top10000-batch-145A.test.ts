/**
 * Batch 145, group A — EDHREC ranks 7949–8197. One test per clause most
 * likely to be wrong: Screams from Within's return from the graveyard onto a
 * new host, Matter Reshaper's permanent-and-mana-value gate, Ajani, Mentor of
 * Heroes' announced division and Aura-or-creature look, Rite of Consumption's
 * drain, Smellerbee's discard-and-draw count, Drowner of Hope's Scion
 * sacrifice, the graveyard counts of Spider Spawning and Hallowed
 * Spiritkeeper, Jagged-Scar Archers' Elf count and flying-only target, Life
 * Finds a Way's power gate, Memnarch's lasting control and Lashwrithe's Swamps.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Screams from Within", () => {
  it("returns from your graveyard when the enchanted creature dies, enchanting a creature you choose", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const screams = toHand(game, "Screams from Within");
    cast(game, screams, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    a.chooseEnchantFn = () => giant;
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, screams)).toBe("battlefield");
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Matter Reshaper", () => {
  it("may put a permanent card with mana value 3 or less onto the battlefield", () => {
    const { game, a } = table();
    const reshaper = spawn(game, "Matter Reshaper");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    destroy(game, reshaper);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("puts a card with mana value 4 into your hand", () => {
    const { game } = table();
    const reshaper = spawn(game, "Matter Reshaper");
    const giant = toLibrary(game, "Hill Giant");
    destroy(game, reshaper);
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Ajani, Mentor of Heroes", () => {
  it("distributes three counters as announced", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Mentor of Heroes");
    game.state.objects[ajani].counters.loyalty = 4;
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: ajani,
      abilityIndex: 0,
      targets: [ref(bears), ref(giant)],
      division: [2, 1],
    });
    settle(game);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, giant)).toBe(1);
  });

  it("offers an Aura or a creature from the top four, not a land or an instant", () => {
    const { game, a } = table();
    const ajani = spawn(game, "Ajani, Mentor of Heroes");
    game.state.objects[ajani].counters.loyalty = 4;
    toLibrary(game, "Island");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const pacifism = toLibrary(game, "Pacifism");
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      if (offered.length > 0) return eligible.slice(0, min); // the rest's order
      offered = eligible;
      return [pacifism];
    };
    activate(game, ajani, 1);
    expect([...offered].sort()).toEqual([bears, pacifism].sort());
    expect(offered).not.toContain(bolt);
    expect(zone(game, pacifism)).toBe("hand");
  });
});

describe("Rite of Consumption", () => {
  it("deals the sacrificed creature's power to the target and gains that much life", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant");
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: toHand(game, "Rite of Consumption"),
      targets: [ref(B)],
      sacrifice: giant,
    });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Smellerbee, Rebel Fighter", () => {
  it("discards your hand and draws one card for each attacking creature", () => {
    const { game, a } = table();
    const smellerbee = spawn(game, "Smellerbee, Rebel Fighter");
    const bears = spawn(game, "Grizzly Bears");
    const held = [...hand(game)];
    expect(held.length).toBeGreaterThan(2);
    pickModes(a, 0);
    attack(game, a, [smellerbee, bears]);
    expect(hand(game)).toHaveLength(2);
    for (const id of held) expect(zone(game, id)).toBe("graveyard");
  });
});

describe("Drowner of Hope", () => {
  it("makes two Scions, and a Scion sacrificed taps a creature", () => {
    const { game } = table();
    const drowner = enter(game, "Drowner of Hope");
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    const scion = named(game, "Eldrazi Scion Token", A)[0];
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: drowner,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: scion,
    });
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });
});

describe("Spider Spawning", () => {
  it("makes a Spider for each creature card in your graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Island");
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spider Spawning"));
    expect(tokensNamed(game, "1/2 Green Spider Token (Reach)", A)).toBe(2);
  });
});

describe("Hallowed Spiritkeeper", () => {
  it("counts itself among the creature cards in your graveyard", () => {
    const { game } = table();
    const keeper = spawn(game, "Hallowed Spiritkeeper");
    toGraveyard(game, "Grizzly Bears");
    destroy(game, keeper);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });
});

describe("Jagged-Scar Archers", () => {
  it("is as big as your Elves and shoots only a flier", () => {
    const { game } = table();
    const archers = spawn(game, "Jagged-Scar Archers");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves", B);
    expect(pt(game, archers)).toEqual({ power: 2, toughness: 2 });
    const bears = spawn(game, "Grizzly Bears", B);
    const flier = spawn(game, "Serra Angel", B);
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === archers);
    const legal = JSON.stringify(offer);
    expect(legal).toContain(flier);
    expect(legal).not.toContain(bears);
    activate(game, archers, 0, { targets: [ref(flier)] });
    expect(game.state.objects[flier].damageMarked).toBe(2);
  });
});

describe("Life Finds a Way", () => {
  it("populates for a nontoken creature with power 4 or greater, not a smaller one", () => {
    const { game, a } = table();
    spawn(game, "Life Finds a Way");
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    pickPermanents(a, named(game, "Spirit Token", A)[0]);
    enter(game, "Craw Wurm");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });
});

describe("Memnarch", () => {
  it("keeps control of the artifact after Memnarch leaves", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const memnarch = spawn(game, "Memnarch");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, memnarch, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].controller).toBe(B);
    activate(game, memnarch, 1, { targets: [ref(bears)] });
    expect(game.state.objects[bears].controller).toBe(A);
    destroy(game, memnarch);
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("Lashwrithe", () => {
  it("makes a Germ that gets +1/+1 for each Swamp you control", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    enter(game, "Lashwrithe");
    const germ = named(game, "Phyrexian Germ Token", A)[0];
    expect(pt(game, germ)).toEqual({ power: 3, toughness: 3 });
  });
});
