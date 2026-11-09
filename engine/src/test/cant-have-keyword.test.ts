/**
 * "Can't have or gain" a keyword — `StaticAbility.cantHaveKeywords` (the
 * Archetypes) and the `become` effect's `cantHave` (Arcane Lighthouse):
 * no timestamp beats it, a static grant waits it out, and a resolving grant
 * made while it applies is never created. Colossus Hammer is the plain
 * "loses flying" beside it, which timestamps do decide. Written from the
 * cards' Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, grant, keywords, lands, ref, spawn, table, toHand, zone } from "./harness.js";

type G = Parameters<typeof lands>[0];

function mana(game: G, n = 2): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, n);
}

function hexproofFromColors(game: G, id: ObjectId): readonly string[] {
  return [...computeCharacteristics(game.state, game.registry, id).hexproofFrom.colors];
}

describe("can't have or gain a keyword (the Archetypes)", () => {
  it("gives yours flying, and takes it from an opponent's creature for as long as it's there", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Grizzly Bears");
    const archetype = spawn(game, "Archetype of Imagination");
    expect(keywords(game, mine).has("flying")).toBe(true);
    expect(keywords(game, archetype).has("flying")).toBe(true);
    expect(keywords(game, angel).has("flying")).toBe(false);
    // Only flying goes.
    expect(keywords(game, angel).has("vigilance")).toBe(true);
    game.debugMove(archetype, "graveyard");
    expect(keywords(game, angel).has("flying")).toBe(true);
    expect(keywords(game, mine).has("flying")).toBe(false);
  });

  it("reaches one that enters after it (the ruling), which a mere loss by timestamp wouldn't", () => {
    const { game } = table();
    spawn(game, "Archetype of Imagination");
    const angel = spawn(game, "Serra Angel", B);
    expect(keywords(game, angel).has("flying")).toBe(false);
  });

  it("a resolving grant isn't created, so it doesn't appear when the Archetype leaves that turn (the ruling)", () => {
    const { game } = table();
    const archetype = spawn(game, "Archetype of Imagination");
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "flying");
    expect(keywords(game, bears).has("flying")).toBe(false);
    game.debugMove(archetype, "graveyard");
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("a resolving animation keeps the rest of what it gives, without the keyword, even after the Archetype leaves", () => {
    const { game } = table();
    const archetype = spawn(game, "Archetype of Imagination");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(
      B,
      {
        kind: "become",
        target: 0,
        power: 4,
        toughness: 4,
        addSubtypes: ["Elemental"],
        keywords: ["flying", "vigilance"],
        duration: "end-of-turn",
      },
      [ref(bears)],
    );
    expect(computeCharacteristics(game.state, game.registry, bears).power).toBe(4);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    game.debugMove(archetype, "graveyard");
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });

  it("a grant made before the Archetype came is held off, and is back when it leaves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "flying");
    const archetype = spawn(game, "Archetype of Imagination");
    expect(keywords(game, bears).has("flying")).toBe(false);
    game.debugMove(archetype, "graveyard");
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("a static grant later than it is held off too, and resumes when it leaves (the ruling)", () => {
    const { game } = table();
    const archetype = spawn(game, "Archetype of Imagination");
    const bears = spawn(game, "Grizzly Bears", B);
    // Their own Archetype of Imagination is the later static that says "have".
    const theirs = spawn(game, "Archetype of Imagination", B);
    // "If you and an opponent each control the same Archetype, no creature
    // controlled by any player will have the appropriate ability."
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
    expect(keywords(game, archetype).has("flying")).toBe(false);
    game.debugMove(archetype, "graveyard");
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("a keyword counter gives nothing while it applies, and stays on the creature", () => {
    const { game } = table();
    spawn(game, "Archetype of Imagination");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "flying", amount: 1 }, [ref(bears)]);
    expect(game.state.objects[bears].counters.flying).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("a static asking who has the keyword reads it as gone", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    spawn(game, "Air Nomad Legacy", B);
    expect(computeCharacteristics(game.state, game.registry, angel).power).toBe(5);
    spawn(game, "Archetype of Imagination");
    expect(computeCharacteristics(game.state, game.registry, angel).power).toBe(4);
  });

  it("Archetype of Endurance: can't have hexproof takes every hexproof from too (rule 702.11e)", () => {
    const { game } = table();
    const scout = spawn(game, "Gladecover Scout", B);
    const knight = spawn(game, "Knight of Grace", B);
    expect(hexproofFromColors(game, knight)).toEqual(["B"]);
    const archetype = spawn(game, "Archetype of Endurance");
    expect(keywords(game, scout).has("hexproof")).toBe(false);
    expect(hexproofFromColors(game, knight)).toEqual([]);
    game.debugMove(archetype, "graveyard");
    expect(keywords(game, scout).has("hexproof")).toBe(true);
    expect(hexproofFromColors(game, knight)).toEqual(["B"]);
  });
});

describe("Arcane Lighthouse", () => {
  it("lets you target what had hexproof or shroud, and a later grant isn't created", () => {
    const { game } = table();
    const lighthouse = spawn(game, "Arcane Lighthouse");
    const scout = spawn(game, "Gladecover Scout", B);
    const shrouded = spawn(game, "Lumengrid Warden", B);
    grant(game, shrouded, "shroud");
    mana(game);
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(scout)] })).toThrow();
    activate(game, lighthouse, 1);
    expect(keywords(game, scout).has("hexproof")).toBe(false);
    expect(keywords(game, shrouded).has("shroud")).toBe(false);
    // A later grant, which beats a plain loss, isn't created.
    grant(game, scout, "hexproof");
    expect(keywords(game, scout).has("hexproof")).toBe(false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(scout)] });
    expect(zone(game, scout)).toBe("graveyard");
  });

  it("reaches only those there as it resolves, and only yours are spared", () => {
    const { game } = table();
    const lighthouse = spawn(game, "Arcane Lighthouse");
    const mine = spawn(game, "Gladecover Scout");
    mana(game);
    activate(game, lighthouse, 1);
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    // The rule 611.2c ruling: entering later, it's unaffected.
    const later = spawn(game, "Gladecover Scout", B);
    expect(keywords(game, later).has("hexproof")).toBe(true);
  });

  it("holds off a static grant for the turn, which is back the next", () => {
    const { game } = table();
    const lighthouse = spawn(game, "Arcane Lighthouse");
    const scout = spawn(game, "Gladecover Scout", B);
    mana(game);
    activate(game, lighthouse, 1);
    expect(keywords(game, scout).has("hexproof")).toBe(false);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(keywords(game, scout).has("hexproof")).toBe(true);
  });
});

describe("a loss of hexproof takes hexproof from too (rule 702.11e)", () => {
  it("Shadowspear: Knight of Grace loses hexproof from black until end of turn", () => {
    const { game } = table();
    const spear = spawn(game, "Shadowspear");
    const knight = spawn(game, "Knight of Grace", B);
    mana(game);
    activate(game, spear, 0);
    expect(hexproofFromColors(game, knight)).toEqual([]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hexproofFromColors(game, knight)).toEqual(["B"]);
  });
});

describe("Colossus Hammer", () => {
  it("gets +10/+10 and loses flying; flying granted after it stays (the rulings)", () => {
    const { game } = table();
    const hammer = spawn(game, "Colossus Hammer");
    const angel = spawn(game, "Serra Angel");
    const bears = spawn(game, "Grizzly Bears");
    mana(game);
    activate(game, hammer, 0, { targets: [ref(angel)] });
    const angelNow = computeCharacteristics(game.state, game.registry, angel);
    expect(angelNow.power).toBe(14);
    expect(angelNow.toughness).toBe(14);
    expect(angelNow.keywords.has("flying")).toBe(false);
    expect(angelNow.keywords.has("vigilance")).toBe(true);
    grant(game, angel, "flying");
    expect(keywords(game, angel).has("flying")).toBe(true);
    // A creature that never flew just gets the bonus.
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("an 'as long as' flying of its own doesn't come back (the ruling)", () => {
    const { game } = table();
    const hammer = spawn(game, "Colossus Hammer");
    const tinkerer = spawn(game, "Aeronaut Tinkerer");
    spawn(game, "Sol Ring");
    expect(keywords(game, tinkerer).has("flying")).toBe(true);
    mana(game);
    activate(game, hammer, 0, { targets: [ref(tinkerer)] });
    expect(keywords(game, tinkerer).has("flying")).toBe(false);
  });
});
