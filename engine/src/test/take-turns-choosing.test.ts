/**
 * `take-turns-choosing`: players take turns, starting with the effect's
 * controller, choosing one card each from the pile this resolution exiled,
 * until no player could choose any — Thieves' Auction: "Exile all nontoken
 * permanents. Starting with you, each player chooses one of the exiled cards
 * and puts it onto the battlefield tapped under their control. Repeat this
 * process until all cards exiled this way have been chosen."
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  controller,
  lands,
  named,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const AUCTION = "Thieves' Auction";

/** Seven Mountains for alice, and the spell in her hand. */
function ready(game: Parameters<typeof lands>[0]): ObjectId {
  lands(game, "Mountain", 7);
  return toHand(game, AUCTION);
}

describe("Thieves' Auction", () => {
  it("every nontoken permanent is auctioned in turn order, each entering tapped under its chooser", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const island = spawn(game, "Island", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [soldier] = named(game, "Soldier Token", B);
    const spell = ready(game);
    const turns: PlayerId[] = [];
    const offers: (readonly ObjectId[])[] = [];
    // Alice wants the Giant, then Bob's land; Bob the Bears first.
    a.chooseFromZoneFn = (_view, eligible, min) => {
      turns.push(A);
      offers.push(eligible);
      expect(min).toBe(1);
      return [eligible.includes(giant) ? giant : eligible.includes(island) ? island : eligible[0]!];
    };
    b.chooseFromZoneFn = (_view, eligible) => {
      turns.push(B);
      offers.push(eligible);
      return [eligible.includes(bears) ? bears : eligible[0]!];
    };
    cast(game, spell);
    // 7 Mountains + Bears + Giant + Island: 10 cards, five turns each, Alice first.
    expect(turns).toEqual([A, B, A, B, A, B, A, B, A, B]);
    // The first offer is every card exiled; each later one a card fewer.
    expect(offers[0]).toHaveLength(10);
    expect(offers.map((o) => o.length)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, island)).toBe(A);
    expect(controller(game, bears)).toBe(B);
    for (const id of [giant, island, bears]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    // The token was never exiled.
    expect(soldier).toBeDefined();
    expect(zone(game, soldier!)).toBe("battlefield");
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    expect(game.battlefield.filter((id) => controller(game, id) === A)).toHaveLength(5);
    expect(game.battlefield.filter((id) => !game.state.objects[id].isToken && controller(game, id) === B)).toHaveLength(5);
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("three players: Alice, Bob, Carol, Alice, … until the pile is gone", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", C);
    const spell = ready(game);
    const turns: PlayerId[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      turns.push(B);
      return [eligible[0]!];
    };
    c.chooseFromZoneFn = (_view, eligible) => {
      turns.push(C);
      return [eligible[0]!];
    };
    cast(game, spell);
    // 9 cards: Alice takes 3, Bob 3, Carol 3.
    expect(turns).toEqual([B, C, B, C, B, C]);
    expect(game.battlefield.filter((id) => controller(game, id) === A)).toHaveLength(3);
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });

  it("an Aura with nothing to enchant can't be chosen, and stays exiled once only it is left", () => {
    const { game, a, b } = table();
    // Animate Dead in exile is "enchant creature card in a graveyard": with
    // every graveyard empty, it has nothing to enchant.
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const animate = toHand(game, "Animate Dead");
    lands(game, "Swamp", 2);
    cast(game, animate, { targets: [ref(bears)] });
    expect(zone(game, animate)).toBe("battlefield");
    const spell = ready(game);
    const offers: (readonly ObjectId[])[] = [];
    for (const seat of [a, b]) {
      seat.chooseFromZoneFn = (_view, eligible) => {
        offers.push(eligible);
        return [eligible[0]!];
      };
    }
    cast(game, spell);
    // Seven Mountains, two Swamps and the Bears go; Animate Dead is never offered.
    expect(offers).toHaveLength(10);
    expect(offers.every((o) => !o.includes(animate))).toBe(true);
    expect(zone(game, animate)).toBe("exile");
    expect(game.state.zones.shared.exile).toEqual([animate]);
  });

  it("an Aura becomes a choice once something it could enchant has entered", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const pacifism = spawn(game, "Pacifism", B);
    game.state.objects[pacifism].attachedTo = bears;
    const spell = ready(game);
    let first = true;
    a.chooseFromZoneFn = (_view, eligible) => {
      if (first) {
        first = false;
        // Nothing to enchant yet: the Bears are in the pile too.
        expect(eligible).not.toContain(pacifism);
        return [bears];
      }
      return [eligible.find((id) => id !== pacifism) ?? eligible[0]!];
    };
    let bobOffered: readonly ObjectId[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      if (bobOffered.length === 0) bobOffered = eligible;
      return [eligible.includes(pacifism) ? pacifism : eligible[0]!];
    };
    cast(game, spell);
    expect(bobOffered).toContain(pacifism);
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(controller(game, pacifism)).toBe(B);
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
    expect(controller(game, bears)).toBe(A);
  });

  it("a card chosen that's exiled instead isn't the pile's any more (rule 400.7)", () => {
    const { game, a, b } = table();
    // The Bears first: once the Priest is out, they'd be exiled instead.
    const bears = spawn(game, "Grizzly Bears", B);
    const priest = spawn(game, "Containment Priest", B);
    const spell = ready(game);
    a.chooseFromZoneFn = (_view, eligible) => [eligible.includes(priest) ? priest : eligible[0]!];
    let bobFirst: readonly ObjectId[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      if (bobFirst.length === 0) bobFirst = eligible;
      return [eligible.includes(bears) ? bears : eligible[0]!];
    };
    cast(game, spell);
    // Alice's Priest is out first: Bob's Bears, not cast, are exiled instead.
    expect(bobFirst).toContain(bears);
    expect(controller(game, priest)).toBe(A);
    expect(zone(game, bears)).toBe("exile");
    // Nine cards, every one chosen once: the Bears weren't offered again.
    expect(game.state.zones.shared.exile).toEqual([bears]);
  });
});
