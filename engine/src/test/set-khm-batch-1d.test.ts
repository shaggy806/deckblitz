/**
 * Kaldheim (KHM/KHC), batch 1, part d (2026-10-20). Written on the shared
 * table in `harness.ts`, each from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  type BlockOffer,
  activate,
  blockOffer,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  pickFromZone,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** Answer every choose-from-zone with whichever of `ids` are eligible. */
function pickEach(seat: ReturnType<typeof table>["a"], ...ids: readonly ObjectId[]): void {
  seat.chooseFromZoneFn = (_view, eligible) => ids.filter((id) => eligible.includes(id));
}

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Bounty of Skemfar", () => {
  it("puts a land onto the battlefield tapped and an Elf into your hand, the rest on the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = [1, 2, 3, 4].map(() => toLibrary(game, "Grizzly Bears"));
    const elves = toLibrary(game, "Llanowar Elves");
    const forest = toLibrary(game, "Forest");
    pickEach(a, forest, elves);
    const card = game.debugSpawn("Bounty of Skemfar", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(zone(game, elves)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    for (const id of bears) expect(zone(game, id)).toBe("library");
    // The four leftovers went under the 40 Wastes.
    const positions = bears.map((id) => library.indexOf(id)).sort((x, y) => x - y);
    expect(positions.every((p) => p < 4) || positions.every((p) => p >= library.length - 4)).toBe(true);
    expect(library.length).toBe(36);
  });
});

describe("Bearded Axe", () => {
  it("gives +1/+1 for each Dwarf, Equipment and Vehicle you control, itself included", () => {
    const { game } = table();
    const axe = spawn(game, "Bearded Axe");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Vault Robber");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    activate(game, axe, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    spawn(game, "Raven Wings");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Raven Wings", () => {
  it("gives +1/+0 and flying, and makes the creature a Bird as well", () => {
    const { game } = table();
    const wings = spawn(game, "Raven Wings");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, wings, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Bird"]));
  });
});

describe("Deathknell Berserker", () => {
  it("makes a Zombie Berserker only if its power was 3 or greater as it died", () => {
    const { game } = table();
    const small = spawn(game, "Deathknell Berserker");
    destroy(game, small);
    expect(tokensNamed(game, "Zombie Berserker Token")).toBe(0);
    const big = spawn(game, "Deathknell Berserker");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" }, [
      ref(big),
    ]);
    destroy(game, big);
    expect(tokensNamed(game, "Zombie Berserker Token", A)).toBe(1);
  });
});

describe("Gladewalker Ritualist", () => {
  it("draws only when another Gladewalker Ritualist enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Gladewalker Ritualist");
    enter(game, "Grizzly Bears");
    expect(hand(game).length).toBe(before);
    enter(game, "Gladewalker Ritualist");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Jarl of the Forsaken", () => {
  it("can destroy only an opponent's creature that was dealt damage this turn", () => {
    const { game, a } = table();
    const hurt = spawn(game, "Hill Giant", B);
    const fresh = spawn(game, "Hill Giant", B);
    const hurt2 = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Shock"), { targets: [ref(hurt)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(hurt2)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    const seen = watchTargets(a, (offered) => [offered[0][0] ?? null]);
    enter(game, "Jarl of the Forsaken");
    expect([...seen.offered[0]].sort()).toEqual([hurt, hurt2].sort());
    expect(zone(game, hurt)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Rootless Yew", () => {
  it("finds only a creature card with power or toughness 6 or greater when it dies", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Craw Wurm");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, wurm);
    const yew = spawn(game, "Rootless Yew");
    destroy(game, yew);
    expect(seen.offered).toEqual([wurm]);
    expect(zone(game, wurm)).toBe("hand");
  });
});

describe("Skemfar Elderhall", () => {
  it("shrinks up to one creature you don't control and makes two Elf Warriors", () => {
    const { game } = table();
    const hall = spawn(game, "Skemfar Elderhall");
    game.state.objects[hall].tapped = false;
    lands(game, "Swamp", 2);
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, hall, 1, { targets: [ref(bears)] });
    expect(zone(game, hall)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });

  it("still makes the Elves with no target chosen", () => {
    const { game } = table();
    const hall = spawn(game, "Skemfar Elderhall");
    game.state.objects[hall].tapped = false;
    lands(game, "Swamp", 2);
    lands(game, "Forest", 3);
    activate(game, hall, 1, { targets: [null] });
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });
});

describe("Sigrid, God-Favored", () => {
  it("can't be blocked by a God creature, but can by another creature", () => {
    const { game, a } = table();
    const sigrid = spawn(game, "Sigrid, God-Favored");
    const god = spawn(game, "The Scarab God", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [sigrid]);
    expect(canBlock(offer, god)).toEqual([]);
    expect(canBlock(offer, bears)).toEqual([sigrid]);
  });
});

describe("Vault Robber", () => {
  it("exiles a creature card from your graveyard to make a Treasure", () => {
    const { game } = table();
    const robber = spawn(game, "Vault Robber");
    const dead = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    activate(game, robber, 0);
    expect(zone(game, dead)).toBe("exile");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});
