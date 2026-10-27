/**
 * Champions of Kamigawa (CHK; B212), group C. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  life,
  named,
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
  toStep,
  zone,
} from "./harness.js";

describe("Ragged Veins", () => {
  it("makes the enchanted creature's controller lose the damage it is dealt", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Ragged Veins"), { targets: [ref(giant)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Akki Coalflinger", () => {
  it("gives only attacking creatures first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const flinger = spawn(game, "Akki Coalflinger");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, flinger);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});

describe("Iname, Life Aspect", () => {
  it("exiles itself to return the target Spirit cards", () => {
    const { game, a } = table();
    const iname = spawn(game, "Iname, Life Aspect");
    const spirits = [toGraveyard(game, "Kami of the Waning Moon"), toGraveyard(game, "Soul of Magma")];
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, ...spirits);
    pickModes(a, 0);
    destroy(game, iname);
    settle(game);
    expect(zone(game, iname)).toBe("exile");
    expect(spirits.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("returns nothing when you don't exile it", () => {
    const { game, a } = table();
    const iname = spawn(game, "Iname, Life Aspect");
    const spirit = toGraveyard(game, "Kami of the Waning Moon");
    pickTargets(a, spirit);
    pickModes(a);
    destroy(game, iname);
    settle(game);
    expect(zone(game, iname)).toBe("graveyard");
    expect(zone(game, spirit)).toBe("graveyard");
  });
});

describe("Strength of Cedars", () => {
  it("gives +X/+X for the lands you control", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Strength of Cedars"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Shell of the Last Kappa", () => {
  it("exiles a spell that targets you, then casts it free", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 6);
    const shell = spawn(game, "Shell of the Last Kappa");
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(A)], settle: false });
    activate(game, shell, 0, { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, A)).toBe(20);
    game.state.objects[shell].tapped = false;
    pickTargets(a, B);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, shell, 1);
    expect(zone(game, shell)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Shimatsu the Bloodcloaked", () => {
  it("enters with a counter for each permanent sacrificed, lands included", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const [land] = lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, land, bears);
    const shimatsu = toHand(game, "Shimatsu the Bloodcloaked");
    cast(game, shimatsu);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, shimatsu)).toBe(2);
    expect(pt(game, shimatsu)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Hikari, Twilight Guardian", () => {
  it("leaves on an Arcane spell and returns at the next end step", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Hikari, Twilight Guardian");
    pickModes(a, 0);
    cast(game, toHand(game, "Lava Spike"), { targets: [ref(B)] });
    expect(named(game, "Hikari, Twilight Guardian").filter((id) => zone(game, id) === "battlefield")).toHaveLength(0);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Hikari, Twilight Guardian").filter((id) => zone(game, id) === "battlefield")).toHaveLength(1);
  });
});

describe("Innocence Kami", () => {
  it("untaps when you cast an Arcane spell", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    const kami = spawn(game, "Innocence Kami");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, kami, 0, { targets: [ref(bears)] });
    expect(game.state.objects[kami].tapped).toBe(true);
    cast(game, toHand(game, "Lava Spike"), { targets: [ref(B)] });
    expect(game.state.objects[kami].tapped).toBe(false);
  });
});

describe("Ore Gorger", () => {
  it("may destroy a nonbasic land when you cast a Spirit spell", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    spawn(game, "Ore Gorger");
    const nonbasic = spawn(game, "Lantern-Lit Graveyard", B);
    pickTargets(a, nonbasic);
    pickModes(a, 0);
    cast(game, toHand(game, "Kami of the Waning Moon"));
    expect(zone(game, nonbasic)).toBe("graveyard");
  });
});
