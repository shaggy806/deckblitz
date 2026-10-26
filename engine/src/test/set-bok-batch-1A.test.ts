/**
 * Saviors of Kamigawa and Betrayers of Kamigawa (SOK, BOK; B202), group A.
 * One test per card whose behaviour is more than a stat line or an exact
 * copy of an already-tested pattern, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
  life,
} from "./harness.js";

describe("Deathmask Nezumi", () => {
  it("is a 4/3 with fear only while its controller has seven or more cards in hand", () => {
    const { game } = table();
    const rat = spawn(game, "Deathmask Nezumi");
    expect(hand(game).length).toBeGreaterThanOrEqual(7);
    expect(pt(game, rat)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, rat).has("fear")).toBe(true);
    const excess = hand(game).length - 6;
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: excess }, [ref(A)]);
    settle(game);
    expect(hand(game)).toHaveLength(6);
    expect(pt(game, rat)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, rat).has("fear")).toBe(false);
  });
});

describe("Sink into Takenuma", () => {
  it("makes the target player discard one card for each Swamp returned", () => {
    const { game, a } = table();
    const swamps = lands(game, "Swamp", 4);
    pickPermanents(a, swamps[0], swamps[1]);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Sink into Takenuma"), { targets: [ref(B)] });
    expect(zone(game, swamps[0])).toBe("hand");
    expect(zone(game, swamps[1])).toBe("hand");
    expect(zone(game, swamps[2])).toBe("battlefield");
    expect(hand(game, B)).toHaveLength(before - 2);
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Toshiro Umezawa", () => {
  it("casts an instant from the graveyard, paying for it, when an opponent's creature dies, and exiles it", () => {
    const { game, a } = table();
    spawn(game, "Toshiro Umezawa");
    const [mountain] = lands(game, "Mountain", 1);
    const shock = toGraveyard(game, "Shock");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, shock);
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: shock,
      targets: [ref(B)],
      via: offer.casts.find((c) => c.card === shock)!.via,
    });
    destroy(game, bears);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[mountain].tapped).toBe(true);
    expect(zone(game, shock)).toBe("exile");
  });

  it("doesn't trigger on its controller's own creature dying", () => {
    const { game, a } = table();
    spawn(game, "Toshiro Umezawa");
    lands(game, "Mountain", 1);
    const shock = toGraveyard(game, "Shock");
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    destroy(game, spawn(game, "Grizzly Bears", A));
    settle(game);
    expect(offered).toBe(false);
    expect(zone(game, shock)).toBe("graveyard");
  });
});

describe("Orb of Dreams", () => {
  it("enters untapped itself, then every other permanent enters tapped", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const orb = toHand(game, "Orb of Dreams");
    cast(game, orb);
    expect(zone(game, orb)).toBe("battlefield");
    expect(game.state.objects[orb].tapped).toBe(false);
    const theirs = enter(game, "Grizzly Bears", B);
    const mine = enter(game, "Grizzly Bears", A);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(true);
  });
});

describe("Yukora, the Prisoner", () => {
  it("leaving sacrifices its controller's non-Ogre creatures only", () => {
    const { game } = table();
    const yukora = spawn(game, "Yukora, the Prisoner");
    const bears = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Barrage Ogre");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, yukora);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Harbinger of Spring", () => {
  it("takes no damage from a non-Spirit creature", () => {
    const { game } = table();
    const harbinger = spawn(game, "Harbinger of Spring");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Prey Upon"), { targets: [ref(harbinger), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, harbinger)).toBe("battlefield");
  });
});
