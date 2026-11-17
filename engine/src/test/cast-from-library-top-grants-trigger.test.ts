/**
 * Galea, Kindler of Hope: "You may cast Aura and Equipment spells from the top
 * of your library. When you cast an Equipment spell this way, it gains 'When
 * this Equipment enters, attach it to target creature you control.'"
 *
 * The permission is a static `mayPlay` from the library's top; "when you cast
 * … this way" is a `plays-card` cast trigger narrowed to the permission of
 * this permanent (`underThis`), whose `grant-triggered` reaches the spell and
 * the permanent it becomes (rule 400.7a). An Equipment cast from the top under
 * another permission (Mystic Forge's — the player's choice, rule 601.3) or
 * from the hand gains nothing.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, pickTargets, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "library-top");
const attachedTo = (game: Game, id: ObjectId): ObjectId | undefined => game.state.objects[id].attachedTo ?? undefined;

describe("Galea, Kindler of Hope", () => {
  it("casts an Equipment from the top, which enters and attaches to a target creature of yours", () => {
    const { game, a } = table();
    spawn(game, "Galea, Kindler of Hope");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const splitter = toLibrary(game, "Bonesplitter");
    expect(castOffers(game, splitter)).toHaveLength(1);
    pickTargets(a, bears);
    cast(game, splitter, { via: "library-top" });
    expect(zone(game, splitter)).toBe("battlefield");
    expect(attachedTo(game, splitter)).toBe(bears);
  });

  it("casts an Aura from the top, but not a creature", () => {
    const { game } = table();
    spawn(game, "Galea, Kindler of Hope");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const ogre = toLibrary(game, "Grizzly Bears");
    expect(castOffers(game, ogre)).toHaveLength(0);
    const rancor = toLibrary(game, "Rancor");
    expect(castOffers(game, rancor)).toHaveLength(1);
    cast(game, rancor, { via: "library-top", targets: [ref(bears)] });
    expect(zone(game, rancor)).toBe("battlefield");
    expect(attachedTo(game, rancor)).toBe(bears);
  });

  it("an Equipment cast from the top under Mystic Forge's permission gains nothing", () => {
    const { game, a } = table();
    spawn(game, "Galea, Kindler of Hope");
    const forge = spawn(game, "Mystic Forge");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    const splitter = toLibrary(game, "Bonesplitter");
    const offers = castOffers(game, splitter);
    expect(offers).toHaveLength(2);
    pickTargets(a, bears);
    cast(game, splitter, { via: "library-top", graveyardGrant: { source: forge } });
    expect(zone(game, splitter)).toBe("battlefield");
    expect(attachedTo(game, splitter)).toBeUndefined();
  });

  it("under Galea's own, chosen beside Mystic Forge's, it attaches", () => {
    const { game, a } = table();
    const galea = spawn(game, "Galea, Kindler of Hope");
    spawn(game, "Mystic Forge");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    const splitter = toLibrary(game, "Bonesplitter");
    pickTargets(a, bears);
    cast(game, splitter, { via: "library-top", graveyardGrant: { source: galea } });
    expect(attachedTo(game, splitter)).toBe(bears);
  });

  it("an Equipment cast from the hand gains nothing", () => {
    const { game, a } = table();
    spawn(game, "Galea, Kindler of Hope");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const splitter = toHand(game, "Bonesplitter");
    pickTargets(a, bears);
    cast(game, splitter);
    expect(zone(game, splitter)).toBe("battlefield");
    expect(attachedTo(game, splitter)).toBeUndefined();
  });

  it("a bestow creature card on top is cast only bestowed: an Aura spell then (rule 702.103d)", () => {
    const { game } = table();
    spawn(game, "Galea, Kindler of Hope");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const eidolon = toLibrary(game, "Hopeful Eidolon");
    const offers = castOffers(game, eidolon);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((o) => o.kind === "cast-spell" && o.overload === true)).toBe(true);
    const plain = { type: "cast-spell", player: A, card: eidolon, targets: [], via: "library-top" } as const;
    expect(game.canDispatch(plain)).toMatch(/top of their library/);
    cast(game, eidolon, { via: "library-top", overload: true, targets: [ref(bears)] });
    expect(zone(game, eidolon)).toBe("battlefield");
    expect(attachedTo(game, eidolon)).toBe(bears);
  });

  it("the spell gains the ability as the cast trigger resolves, not as it's cast", () => {
    const { game, a } = table();
    spawn(game, "Galea, Kindler of Hope");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const splitter = toLibrary(game, "Bonesplitter");
    cast(game, splitter, { via: "library-top", settle: false });
    // The trigger waits above the spell; the spell has no granted ability yet.
    expect(game.state.zones.shared.stack.length).toBeGreaterThanOrEqual(1);
    expect(game.state.objects[splitter].modifiers.some((m) => (m.grantsTriggered?.length ?? 0) > 0)).toBe(false);
    pickTargets(a, bears);
    settle(game);
    expect(attachedTo(game, splitter)).toBe(bears);
  });
});

describe("a permission's filter reads a bestow cast bestowed (rule 702.103d)", () => {
  it("Eladamri's \"creature spells\" never casts a bestow card bestowed: it's an Aura spell then", () => {
    const { game } = table();
    spawn(game, "Eladamri, Korvecdal");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const eidolon = toLibrary(game, "Hopeful Eidolon");
    const offers = castOffers(game, eidolon);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((o) => o.kind === "cast-spell" && o.overload !== true)).toBe(true);
    const bestowed = { type: "cast-spell", player: A, card: eidolon, targets: [ref(bears)], via: "library-top", overload: true } as const;
    expect(game.canDispatch(bestowed)).toMatch(/top of their library/);
    cast(game, eidolon, { via: "library-top" });
    expect(zone(game, eidolon)).toBe("battlefield");
    expect(attachedTo(game, eidolon)).toBeUndefined();
  });

  it("beside Galea, either: each permission reaches it one way", () => {
    const { game } = table();
    spawn(game, "Galea, Kindler of Hope");
    spawn(game, "Eladamri, Korvecdal");
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    const eidolon = toLibrary(game, "Hopeful Eidolon");
    const offers = castOffers(game, eidolon);
    expect(offers.some((o) => o.kind === "cast-spell" && o.overload === true)).toBe(true);
    expect(offers.some((o) => o.kind === "cast-spell" && o.overload !== true)).toBe(true);
  });
});
