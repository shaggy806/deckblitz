/**
 * Cards freed by the search-opponent-library family (B248): searches of
 * another player's library, or of their graveyard, hand and library together
 * (`search-library`'s `whose` — see `search-other-player.test.ts` for the
 * feature's own tests). One test per thing a card adds to it.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** The seat answers each choose-from-zone with the next of these. */
function pickInTurn(seat: ScriptedController, ...answers: (readonly ObjectId[])[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseFromZoneFn = (_v, eligible) => {
    seen.offered.push(eligible);
    return answers.shift() ?? [];
  };
  return seen;
}

describe("search-opponent-library family", () => {
  it("Deadly Cover-Up, evidence collected: exiles a chosen card from an opponent's graveyard, then its namesakes", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const evidence = [toGraveyard(game, "Hill Giant"), toGraveyard(game, "Hill Giant")];
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const inHand = toHand(game, "Lightning Bolt", B);
    const bear = spawn(game, "Grizzly Bears", B);
    const kept = hand(game, B).length;
    const seen = pickInTurn(a, evidence, [bolt], [inHand]);
    cast(game, toHand(game, "Deadly Cover-Up"), { kicked: true });
    expect(zone(game, bear)).toBe("graveyard");
    // The second choice is over opponents' graveyards only.
    expect(seen.offered[1]).toContain(bolt);
    expect(seen.offered[1].every((id) => game.state.objects[id].owner === B)).toBe(true);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, inHand)).toBe("exile");
    // Bob drew one for the card exiled from his hand.
    expect(hand(game, B)).toHaveLength(kept);
  });

  it("Deadly Cover-Up without evidence only destroys", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const seen = pickInTurn(a);
    cast(game, toHand(game, "Deadly Cover-Up"));
    expect(seen.offered).toHaveLength(0);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("Deicide searches only when the exiled card is a God card", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const heliod = spawn(game, "Heliod, God of the Sun", B);
    const another = toLibrary(game, "Heliod, God of the Sun", B);
    const seen = pickFromZone(a, another);
    cast(game, toHand(game, "Deicide"), { targets: [ref(heliod)] });
    expect(zone(game, heliod)).toBe("exile");
    expect(seen.offered).toEqual([another]);
    expect(zone(game, another)).toBe("exile");

    const anthem = spawn(game, "Glorious Anthem", B);
    const second = toLibrary(game, "Glorious Anthem", B);
    const none = pickFromZone(a, second);
    cast(game, toHand(game, "Deicide"), { targets: [ref(anthem)] });
    expect(zone(game, anthem)).toBe("exile");
    expect(none.offered).toEqual([]);
    expect(zone(game, second)).toBe("library");
  });

  it("Eradicate exiles the creature, then every card named like it in its controller's graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const inYard = toGraveyard(game, "Hill Giant", B);
    const inLibrary = toLibrary(game, "Hill Giant", B);
    const seen = pickFromZone(a, inLibrary);
    cast(game, toHand(game, "Eradicate"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(seen.offered).toEqual([inLibrary]);
    expect(zone(game, inYard)).toBe("exile");
    expect(zone(game, inLibrary)).toBe("exile");
  });

  it("Seek gains life equal to the exiled card's mana value", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const giant = toLibrary(game, "Hill Giant", B);
    pickFromZone(a, giant);
    cast(game, toHand(game, "Hide // Seek"), { targets: [ref(B)], face: 2 });
    expect(zone(game, giant)).toBe("exile");
    expect(life(game)).toBe(24);
  });

  it("Rootwater Thief: pay {2} as it deals combat damage, and exile a card of that player's", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const thief = spawn(game, "Rootwater Thief");
    const bolt = toLibrary(game, "Lightning Bolt", B);
    pickModes(a, 0);
    pickFromZone(a, bolt);
    attack(game, a, [thief]);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("Sadistic Sacrament kicked searches for up to fifteen", () => {
    const { game, a } = table();
    lands(game, "Swamp", 10);
    let most = 0;
    a.chooseFromZoneFn = (_v, eligible, _min, max) => {
      most = max;
      return eligible.slice(0, max);
    };
    cast(game, toHand(game, "Sadistic Sacrament"), { targets: [ref(B)], kicked: true });
    expect(most).toBe(15);
    expect(Object.values(game.state.objects).filter((o) => o.owner === B && o.zone === "exile")).toHaveLength(15);
  });

  it("Neverending Torment must find X, the cards in its caster's hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    let least = -1;
    a.chooseFromZoneFn = (_v, eligible, min) => {
      least = min;
      return eligible.slice(0, min);
    };
    const torment = toHand(game, "Neverending Torment");
    const inHand = hand(game).length - 1;
    cast(game, torment, { targets: [ref(B)] });
    expect(least).toBe(inHand);
  });

  it("Necromentia's Zombies are that player's, one for each card exiled from their hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    a.chooseCardNameFn = () => "Lightning Bolt";
    const inHand = [toHand(game, "Lightning Bolt", B), toHand(game, "Lightning Bolt", B)];
    pickFromZone(a, ...inHand);
    cast(game, toHand(game, "Necromentia"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Zombie Token", B)).toBe(2);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("Mimeofacture finds a card named like the target permanent, for the searcher", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", B);
    const another = toLibrary(game, "Hill Giant", B);
    toLibrary(game, "Grizzly Bears", B);
    const seen = pickFromZone(a, another);
    cast(game, toHand(game, "Mimeofacture"), { targets: [ref(giant)] });
    expect(seen.offered).toEqual([another]);
    expect(controller(game, another)).toBe(A);
  });

  it("Test of Talents: its controller draws for each card exiled from their hand", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const another = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickFromZone(a, another);
    const before = hand(game).length;
    cast(game, toHand(game, "Test of Talents"), { targets: [ref(bolt)] });
    expect(zone(game, another)).toBe("exile");
    // Test of Talents and the other Bolt left the hand; one drawn back.
    expect(hand(game).length).toBe(before);
    expect(life(game, B)).toBe(20);
  });

  it("The End costs {2} less at 5 life or less", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    const end = toHand(game, "The End");
    expect(() => cast(game, end, { targets: [ref(bear)] })).toThrow();
    game.state.players[A].life = 5;
    cast(game, end, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("exile");
  });
});
