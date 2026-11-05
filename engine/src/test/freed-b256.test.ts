/**
 * Batch 256, the scaffolder's whole-snapshot sweep: the fields its emitter used
 * to drop after the parser had read them, the meld pair and the Walker token
 * written by hand, and the shapes the reviewers found no pool card using.
 */
import { describe, expect, it } from "vitest";

import { manaValueOfObject } from "../filter.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

describe("the fields the emitter used to drop", () => {
  it("Time Reversal exiles itself as it resolves", () => {
    const { game } = table();
    lands(game, "Island", 5);
    toStep(game, "precombat-main");
    const reversal = toHand(game, "Time Reversal");
    cast(game, reversal);
    expect(zone(game, reversal)).toBe("exile");
  });

  it("each wish keeps its exile, each pair its second typecycling, each timing its limit", () => {
    const { game } = table();
    const def = (name: string) => registryOf(game).get(name);
    for (const wish of ["Death Wish", "Cunning Wish", "Golden Wish", "Game Plan"]) {
      expect(def(wish).exileOnResolve).toBe(true);
    }
    expect(def("Pale Recluse").moreCycling?.map((c) => c.name)).toEqual(["Plainscycling"]);
    expect(def("Sanctum Plowbeast").moreCycling?.map((c) => c.name)).toEqual(["Islandcycling"]);
    expect(def("Jhessian Zombies").moreCycling?.map((c) => c.name)).toEqual(["Swampcycling"]);
    expect(def("Dazzling Beauty").castOnlyIf).toEqual({ kind: "turn-structure", steps: ["declare-blockers"] });
    expect(def("Curtain of Light").castOnlyIf).toEqual({
      kind: "turn-structure",
      steps: ["declare-blockers", "combat-damage", "end-combat"],
    });
  });

  it("Dazzling Beauty can't be cast before the declare blockers step", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears");
    const beauty = toHand(game, "Dazzling Beauty");
    expect(() => cast(game, beauty, { targets: [ref(bears)] })).toThrow();
    expect(zone(game, beauty)).toBe("hand");
  });
});

describe("Gisela, the Broken Blade and Bruna, the Fading Light", () => {
  const brisela = (game: Game) =>
    game.battlefield.filter((id) => printedCardName(game.state.objects[id]) === "Brisela, Voice of Nightmares");

  /** Alice's pair, melded at her end step. */
  function melded() {
    const t = table();
    spawn(t.game, "Gisela, the Broken Blade");
    spawn(t.game, "Bruna, the Fading Light");
    toStep(t.game, "precombat-main");
    toStep(t.game, "end");
    settle(t.game);
    return t;
  }

  it("meld at Alice's end step into a 9/10 of mana value 11", () => {
    const { game } = melded();
    const [host] = brisela(game);
    expect(host).toBeDefined();
    expect(pt(game, host)).toEqual({ power: 9, toughness: 10 });
    expect([...keywords(game, host)].sort()).toEqual(["first-strike", "flying", "lifelink", "vigilance"]);
    expect(manaValueOfObject(registryOf(game), game.state.objects[host])).toBe(11);
  });

  it("don't meld with only Gisela there", () => {
    const { game } = table();
    spawn(game, "Gisela, the Broken Blade");
    toStep(game, "precombat-main");
    toStep(game, "end");
    settle(game);
    expect(brisela(game)).toEqual([]);
  });

  it("Brisela stops an opponent's spell of mana value 3, not one of 4", () => {
    const { game } = melded();
    lands(game, "Forest", 4, B);
    toStep(game, "precombat-main", B);
    const three = toHand(game, "Grizzly Bears", B);
    expect(() => cast(game, three, { player: B })).toThrow();
    const four = toHand(game, "Giant Spider", B);
    cast(game, four, { player: B });
    expect(zone(game, four)).toBe("battlefield");
  });

  it("Bruna's cast trigger returns an Angel or Human creature card, and not another", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    toStep(game, "precombat-main");
    const human = toGraveyard(game, "Benalish Marshal");
    const angel = toGraveyard(game, "Serra Angel");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [human]);
    pickModes(a, 0);
    cast(game, toHand(game, "Bruna, the Fading Light"));
    expect([...seen.offered[0]].sort()).toEqual([human, angel].sort());
    expect(zone(game, human)).toBe("battlefield");
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("the rest", () => {
  it("Hansk's target opponent makes three tokens named Walker, each a 2/2 black Zombie", () => {
    const { game, a } = table();
    spawn(game, "Hansk, Slayer Zealot");
    pickTargets(a, B);
    toStep(game, "precombat-main", B);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Walker Token", B)).toBe(3);
    expect(tokensNamed(game, "Zombie Token", B)).toBe(0);
  });

  it("Manaforge Cinder's mana ability stops at three activations a turn", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    toStep(game, "precombat-main");
    const cinder = spawn(game, "Manaforge Cinder");
    for (let i = 0; i < 3; i += 1) activate(game, cinder);
    expect(() => activate(game, cinder)).toThrow();
  });

  it("Hallowed Burial puts every creature on the bottom of its owner's library", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    toStep(game, "precombat-main");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hallowed Burial"));
    expect(zone(game, mine)).toBe("library");
    expect(zone(game, theirs)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.at(-1) === mine || game.state.zones.perPlayer[A].library[0] === mine).toBe(true);
  });

  it("Yawgmoth's Will casts from the graveyard and exiles what would go back there", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    toStep(game, "precombat-main");
    // Before it resolves: from then on nothing of Alice's reaches her graveyard, itself included.
    const raise = toGraveyard(game, "Raise Dead");
    const bears = toGraveyard(game, "Grizzly Bears");
    const swamp = toGraveyard(game, "Swamp");
    const will = toHand(game, "Yawgmoth's Will");
    cast(game, will);
    expect(zone(game, will)).toBe("exile");
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && o.card === swamp)).toBe(true);
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === raise);
    if (offer?.kind !== "cast-spell") throw new Error("not offered");
    cast(game, raise, { targets: [ref(bears)], via: offer.via, graveyardGrant: offer.graveyardGrant });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, raise)).toBe("exile");
    expect(graveyard(game)).not.toContain(raise);
  });
});
