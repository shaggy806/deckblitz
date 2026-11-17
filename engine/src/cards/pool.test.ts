/**
 * Guards the one-file-per-card layout: every `.ts` under `pool/` and `tokens/`
 * must default-export a `CardDefinition`, names must be unique, and the set on
 * disk must exactly match what `createDefaultRegistry()` builds — so adding a
 * card file without re-running `scripts/gen-cards.mjs` fails here rather than
 * silently shipping a card that no registry knows about.
 *
 * Also guards the pool/tokens split the codegen records as `POOL_CARDS` /
 * `TOKEN_CARDS`, since `isTokenCard` has no other way to tell the two apart,
 * and the second copy of the pool the codegen writes for web pages: the
 * shards, and the index of token names and pinned art beside them. The
 * codegen reads each card's name and art from its source text, so these are
 * where a card file it misread fails.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { isTriggeredManaAbility } from "../abilities.js";
import { CARD_SHARD_COUNT, cardShardOf, loadCardShard } from "./card-shards.js";
import { isCardFront, isDeckableCard, isTokenCard } from "./classify.js";
import type { CardDefinition, StaticAbility } from "./define.js";
import { EMBLEM_DEFINITIONS } from "./emblem.js";
import { LOCKED_ROOM_DEFINITION } from "./locked-room.js";
import { FACE_DOWN_DEFINITIONS } from "./face-down.js";
import { SPEED_DEFINITIONS } from "./speed.js";
import { RAD_DEFINITIONS } from "./rad.js";
import { MONARCH_DEFINITIONS } from "./monarch.js";
import { INITIATIVE_DEFINITIONS } from "./initiative.js";
import { DUNGEON_DEFINITIONS } from "./dungeons.js";
import { CARD_FILES, POOL_CARDS, TOKEN_CARDS } from "./generated.js";
import { PINNED_ART, TOKEN_NAMES } from "./generated-index.js";
import { createDefaultRegistry } from "./registry.js";

// The card files on disk, listed rather than imported: importing 16,000
// modules one by one took this file two minutes. Each one's definition is
// the barrel's import of it (`CARD_FILES`), so the barrel has to name exactly
// these files for the tests below to see them.
const cardsDir = fileURLToPath(new URL(".", import.meta.url));
const onDisk = ["pool", "tokens"].flatMap((sub) =>
  readdirSync(path.join(cardsDir, sub))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .map((f) => `${sub}/${f.slice(0, -".ts".length)}`),
);
const files = onDisk.map((file) => [`./${file}.ts`, { default: CARD_FILES[file] }] as const);

// The source text of the same files, for the scaffold guard below.
const sources = Object.fromEntries(
  onDisk.map((file) => [`./${file}.ts`, readFileSync(path.join(cardsDir, `${file}.ts`), "utf8")]),
);

describe("card pool layout", () => {
  it("the barrel imports exactly the card files on disk", () => {
    expect(Object.keys(CARD_FILES).sort(), "run `npm run gen:cards -w engine`").toEqual([...onDisk].sort());
  });

  it("every file default-exports a uniquely-named CardDefinition", () => {
    const seen = new Set<string>();
    for (const [path, mod] of files) {
      const def = mod.default;
      expect(def, `${path} has no default export`).toBeDefined();
      expect(typeof def.name, `${path} default export is not a card`).toBe("string");
      expect(seen.has(def.name), `duplicate card name: ${def.name}`).toBe(false);
      seen.add(def.name);
    }
  });

  it("the registry contains exactly the cards on disk, the face-down 2/2s, the locked Room, the emblem, speed and rad counters", () => {
    const onDisk = new Set(files.map(([, mod]) => mod.default.name));
    const registry = createDefaultRegistry();

    // The internal face-down definitions (rule 708.2a — `cards/face-down.ts`),
    // a Room with both doors locked (709.5 — `cards/locked-room.ts`), the
    // emblem object's (rule 114 — `cards/emblem.ts`), a player's speed
    // ability object's (rule 702.179d — `cards/speed.ts`) and rad counters'
    // (rule 728.1 — `cards/rad.ts`) are registered by hand, never written to
    // disk as cards.
    const internal = [
      ...FACE_DOWN_DEFINITIONS,
      LOCKED_ROOM_DEFINITION,
      ...EMBLEM_DEFINITIONS,
      ...SPEED_DEFINITIONS,
      ...RAD_DEFINITIONS,
      ...MONARCH_DEFINITIONS,
      ...INITIATIVE_DEFINITIONS,
      ...DUNGEON_DEFINITIONS,
    ];
    expect(registry.size).toBe(onDisk.size + internal.length);
    for (const def of internal) {
      expect(onDisk.has(def.name), `${def.name} is a card file too`).toBe(false);
      expect(registry.has(def.name)).toBe(true);
    }
    for (const name of onDisk) {
      expect(
        registry.has(name),
        `${name} is on disk but not registered — run \`npm run gen:cards -w engine\``,
      ).toBe(true);
    }
  });

  it("POOL_CARDS / TOKEN_CARDS match the directories on disk", () => {
    const named = (sub: string) =>
      new Set(
        files.filter(([p]) => p.startsWith(`./${sub}/`)).map(([, mod]) => mod.default.name),
      );
    expect(new Set(POOL_CARDS.map((c) => c.name))).toEqual(named("pool"));
    expect(new Set(TOKEN_CARDS.map((c) => c.name))).toEqual(named("tokens"));
  });
});

describe("card shards", () => {
  const regenerate = "run `npm run gen:cards -w engine`";

  it("hold every card once, each in the shard its name hashes to", async () => {
    const shards = await Promise.all(
      Array.from({ length: CARD_SHARD_COUNT }, (_, i) => loadCardShard(i)),
    );
    const pool: CardDefinition[] = [];
    const tokens: CardDefinition[] = [];
    shards.forEach((shard, i) => {
      for (const def of [...shard.pool, ...shard.tokens]) {
        expect(
          cardShardOf(def.name),
          `${def.name} is in shard ${i}, so gen-cards.mjs misread its name — or ${regenerate}`,
        ).toBe(i);
      }
      pool.push(...shard.pool);
      tokens.push(...shard.tokens);
    });
    // The same definitions, not copies: a shard imports the card's own module.
    const byName = (defs: readonly CardDefinition[]) =>
      [...defs].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    expect(byName(pool), regenerate).toEqual(byName(POOL_CARDS));
    expect(byName(tokens), regenerate).toEqual(byName(TOKEN_CARDS));
    for (const [shard, all] of [
      [pool, POOL_CARDS],
      [tokens, TOKEN_CARDS],
    ] as const) {
      const sorted = byName(all);
      byName(shard).forEach((def, i) => expect(def).toBe(sorted[i]));
    }
  });

  it("an unknown name still names a shard", () => {
    const shard = cardShardOf("Not a Real Card");
    expect(Number.isInteger(shard) && shard >= 0 && shard < CARD_SHARD_COUNT).toBe(true);
  });

  it("the index's token names and pinned art are the definitions' own", () => {
    expect([...TOKEN_NAMES].sort(), regenerate).toEqual(TOKEN_CARDS.map((c) => c.name).sort());
    const pinned = Object.fromEntries(
      POOL_CARDS.flatMap((c) => (c.art === null ? [] : [[c.name, c.art]])),
    );
    expect(PINNED_ART, regenerate).toEqual(pinned);
  });
});

describe("card scaffolds", () => {
  // `npm run card:scaffold` writes a skeleton with a `TODO(scaffold)` per
  // Oracle line still to author, in cards/scaffold/, outside the registry.
  // One reaching pool/ or tokens/ with a TODO left would ship a card missing
  // an ability (AUTHORING §0).
  it("no pool or token file still has a TODO(scaffold)", () => {
    const unfinished = Object.entries(sources)
      .filter(([, text]) => text.includes("TODO(scaffold)"))
      .map(([path]) => path);
    expect(unfinished).toEqual([]);
  });
});

describe("modal spells", () => {
  // Rules 601.2b, 700.2a: a modal spell's modes are chosen as it's cast, so
  // they're part of the spell on the stack. The resolution-time `modal`
  // effect is for a choice made as it resolves ("add one mana of any
  // color"); a spell printed "Choose one —" with bullets uses `castModal`,
  // targets or not. Austere Command was the one authored the other way.
  it("no spell printed with bulleted modes chooses them as it resolves", () => {
    const bulleted = /^Choose [^\n]*—\s*\n•/m;
    const onResolution = POOL_CARDS.filter(
      (def) => def.effect?.kind === "modal" && bulleted.test(def.text),
    ).map((def) => def.name);
    expect(onResolution).toEqual([]);
  });
});

describe("triggered mana abilities", () => {
  // Rule 605.1b: a `tapped-for-mana` trigger that adds mana and has no target
  // is never put on the stack — `Game.tappedForManaExtras` applies it as the
  // mana is made, and reads only an `add-mana` there, so any other shape of
  // adding would silently do nothing. Its amount is read with no X and no
  // trigger value (a mana ability has neither), so one that reads either
  // would add nothing too. Any other effect uses the stack, as any trigger.
  it("are each a single add-mana, with an amount the mana's making can read", () => {
    const unread = POOL_CARDS.flatMap((def) =>
      def.triggered
        .filter((ability) => ability.trigger.on === "tapped-for-mana" && isTriggeredManaAbility(ability))
        .filter(
          (ability) =>
            ability.effect?.kind !== "add-mana" ||
            /"x"|triggerValue/.test(JSON.stringify(ability.effect.amount)),
        )
        .map(() => def.name),
    );
    expect(unread).toEqual([]);
  });

  // An untargeted one that adds mana among other things is a mana ability all
  // the same (rule 605.1b), whatever else it does: the rest is the `add-mana`'s
  // `also`, not a `sequence`, which would use the stack.
  it("say the rest of what they do in `also`", () => {
    const onTheStack = POOL_CARDS.flatMap((def) =>
      def.triggered
        .filter(
          (ability) =>
            ability.trigger.on === "tapped-for-mana" &&
            ability.targets.length === 0 &&
            !isTriggeredManaAbility(ability) &&
            JSON.stringify(ability.effect).includes('"kind":"add-mana"'),
        )
        .map(() => def.name),
    );
    expect(onTheStack).toEqual([]);
  });

  // `add-mana`'s `first` is read for an activated mana ability only
  // (`tappedForManaExtras` doesn't apply one).
  it("put nothing before the mana (`first`)", () => {
    const addsFirst = (node: unknown): boolean =>
      typeof node === "object" &&
      node !== null &&
      (((node as { kind?: unknown }).kind === "add-mana" && "first" in node) || Object.values(node).some(addsFirst));
    const withFirst = POOL_CARDS.flatMap((def) =>
      def.triggered.filter((ability) => addsFirst(ability.effect)).map(() => def.name),
    );
    expect(withFirst).toEqual([]);
  });
});

describe("definition traps", () => {
  // Shapes that type-check and run, and do something other than what the
  // author meant, with nothing said. Each is refused here, by name, so the
  // card is written the way that works.
  type Node = { readonly [key: string]: unknown };
  const isNode = (v: unknown): v is Node => typeof v === "object" && v !== null;
  /** Every object in a definition, depth first. */
  const walk = (value: unknown, visit: (node: Node) => void): void => {
    if (Array.isArray(value)) for (const item of value) walk(item, visit);
    else if (isNode(value)) {
      visit(value);
      for (const child of Object.values(value)) walk(child, visit);
    }
  };
  const every = [...POOL_CARDS, ...TOKEN_CARDS];

  it("`sameAbilityAs` names another entry of the same list", () => {
    const wrong = every
      .filter((def) =>
        (def.triggered ?? []).some(
          (ability, i, list) =>
            ability.sameAbilityAs !== undefined && (ability.sameAbilityAs === i || list[ability.sameAbilityAs] === undefined),
        ),
      )
      .map((def) => def.name);
    expect(wrong).toEqual([]);
  });

  // "Opponent" is read from the ability's controller, as "you" is in Oracle
  // text, not from the player `targetsChosenBy` has choose. "Its controller
  // chooses target permanent another player controls" (Confusion in the
  // Ranks) is `controlledByRef`, relative to the chooser. The one card that
  // means the controller's opponents: Bladegriff Prototype's "of that
  // player's choice that one of **your** opponents controls".
  it("a target someone else chooses doesn't say `whose: \"opponent\"`", () => {
    const wrong = every
      .filter((def) =>
        (def.triggered ?? []).some(
          (ability) => ability.targetsChosenBy !== undefined && /"whose":"opponent"/.test(JSON.stringify(ability.targets)),
        ),
      )
      .map((def) => def.name);
    expect(wrong).toEqual(["Bladegriff Prototype"]);
  });

  // `choose-random-card`'s find replaces every target as target 0 unless it
  // is given a `slot` (or a `count`), so a `then` reading target 1 or later
  // reads nothing.
  it("a random card's `then` reads no target past 0 without a `slot`", () => {
    const wrong = every
      .filter((def) => {
        let bad = false;
        walk(def, (node) => {
          if (node.kind !== "choose-random-card" || node.slot !== undefined || node.count !== undefined) return;
          if (/"(target|from|controllerOf|ownerOf)":[1-9]/.test(JSON.stringify(node.then ?? null))) bad = true;
        });
        return bad;
      })
      .map((def) => def.name);
    expect(wrong).toEqual([]);
  });

  // `exile` reaches a card in a hand only with `fromHand` (a target bounced
  // in response stays where it went), so a card picked at random from a hand
  // and then exiled without it stays in the hand.
  it("a card picked at random from a hand is exiled with `fromHand`", () => {
    const wrong = every
      .filter((def) => {
        let bad = false;
        walk(def, (node) => {
          if (node.kind !== "choose-random-card" || node.zone !== "hand") return;
          const picked = typeof node.slot === "number" ? node.slot : 0;
          walk(node.then ?? null, (inner) => {
            if (inner.kind === "exile" && inner.target === picked && inner.fromHand !== true) bad = true;
          });
        });
        return bad;
      })
      .map((def) => def.name);
    expect(wrong).toEqual([]);
  });

  // A `look-and-choose` that can choose nothing (`max: 0`) over the cards
  // exiled this way never applies its `leftover`: move them with the effect
  // that moves them.
  it("no look-and-choose over the cards exiled this way has `max: 0`", () => {
    const wrong = every
      .filter((def) => {
        let bad = false;
        walk(def, (node) => {
          if (node.kind === "look-and-choose" && node.zone === "exiled-this-way" && node.max === 0) bad = true;
        });
        return bad;
      })
      .map((def) => def.name);
    expect(wrong).toEqual([]);
  });

  it("the walker reaches a nested effect, so the audits above read what's there", () => {
    let seen = 0;
    walk(
      every.find((def) => def.name === "Wondrous Crucible"),
      (node) => {
        if (node.kind === "choose-random-card") seen += 1;
      },
    );
    expect(seen).toBe(1);
  });
});

describe("exile until this leaves the battlefield", () => {
  // `exile { untilSourceLeaves }` returns the card itself as the source
  // leaves — rule 610.3's one-shot effect, not a triggered ability. A
  // `leaves-battlefield` ability running `return-exiled-by-source` beside it
  // would be a second, empty trigger on the stack (and one that card text
  // like Banishing Light's doesn't have). A return of the *other* cards
  // exiled with it (`others`, Mysterious Limousine's "return each other card
  // exiled with this Vehicle") is a different instruction and passes.
  it("no card that exiles this way also carries a return trigger", () => {
    const untilLeaves = /"kind":"exile"[^{}]*"untilSourceLeaves":true/;
    const returnsAll = /"kind":"return-exiled-by-source"(?![^{}]*"others":true)/;
    const doubled = [...POOL_CARDS, ...TOKEN_CARDS]
      .filter((def) => {
        const json = JSON.stringify(def);
        return untilLeaves.test(json) && returnsAll.test(json);
      })
      .map((def) => def.name);
    expect(doubled).toEqual([]);
  });
});

describe("statics that work from the graveyard", () => {
  // Rule 113.6b: `fromGraveyard` makes a static work only while its card is
  // in a graveyard. The layer fold's grants to permanents
  // (`contributingStaticSources`), the granted activated abilities
  // (`abilityGrantSources`, `Game.activatedGrantSources` — Riftstone Portal)
  // and the "enters with" replacements read where a permanent enters
  // (Dearly Departed's counters) look in graveyards for one and pass it by on
  // the battlefield; any other part — another replacement, a type change, a
  // cost change, a granted triggered ability — would still work from the
  // battlefield and never from the graveyard, so a card that needs one waits
  // for the engine.
  it("carry only what is read from a graveyard", () => {
    const read = new Set([
      "affects", "condition", "fromGraveyard", "text",
      "grantPt", "grantPtPerCount", "grantKeywords", "grantToxic", "restrictions",
      "combatDamageByToughness", "canAttackAsThoughNoDefender", "cantBeSacrificed", "protection", "setBasePt",
      "grantsActivated",
    ]);
    const enters = (ability: StaticAbility): boolean => {
      const r = ability.replacement;
      return r?.event === "others-enter-battlefield" && r.exileInstead === undefined && r.asCopyOf === undefined;
    };
    const stray = POOL_CARDS.flatMap((def) =>
      def.static
        .filter((ability) => ability.fromGraveyard === true)
        .flatMap((ability) =>
          Object.keys(ability)
            .filter((key) => !read.has(key) && !(key === "replacement" && enters(ability)))
            .map((key) => `${def.name}: ${key}`),
        ),
    );
    expect(stray).toEqual([]);
  });
});

describe("deckbuilding flags", () => {
  // Rule 903.3a: a card that says it "can be your commander" is the only
  // way a planeswalker commands. `deck-validation.ts` reads the declarative
  // `canBeCommander`, never the text, so the two must agree.
  it("canBeCommander is set exactly on the cards that say they can be your commander", () => {
    const says = (def: CardDefinition): boolean => /can be your commander/i.test(def.text);
    const mismatched = POOL_CARDS.filter((def) => def.canBeCommander !== says(def)).map((d) => d.name);
    expect(mismatched).toEqual([]);
  });

  // Rule 722: a preparation card names its prepare spell by registry key —
  // an instant or sorcery the copy in exile is made from — and a spell that
  // is no card of its own (`prepareSpellOnly`) exists only for one.
  it("every prepare spell is a registered instant or sorcery, and every spell-only one is some card's", () => {
    const registry = createDefaultRegistry();
    const wrong = POOL_CARDS.filter((def) => def.prepareSpell !== null).flatMap((def) => {
      const spell = def.prepareSpell!;
      if (!registry.has(spell)) return [`${def.name}: no "${spell}"`];
      const types = registry.get(spell).types;
      return types.includes("instant") || types.includes("sorcery") ? [] : [`${def.name}: "${spell}" isn't a spell`];
    });
    expect(wrong).toEqual([]);
    const named = new Set(POOL_CARDS.map((def) => def.prepareSpell));
    expect(POOL_CARDS.filter((def) => def.prepareSpellOnly && !named.has(def.name)).map((d) => d.name)).toEqual([]);
  });

  it("a split card's whole has no effect of its own, and a fused one's halves are each one plain effect", () => {
    // Rule 702.102d: a fused split spell resolves as its halves, left then
    // right, each with its own targets — the halves' effects alone.
    const registry = createDefaultRegistry();
    const wholes = POOL_CARDS.filter((def) => def.split && def.faces?.[0] === def.name);
    const wrong = wholes.flatMap((def) => {
      if (def.effect !== null || def.resolve !== null || def.targets.length > 0) return [`${def.name}: the whole has an effect`];
      if (!def.fuse) return [];
      return def.faces!.slice(1).flatMap((name) => {
        const half = registry.get(name);
        // Only the right half may end in an "any number of target …" group,
        // which must be the fused spell's last slot.
        const grouped = name === def.faces![1] && half.targets.some((t) => typeof t === "object" && t.kind === "any-number");
        const plain = half.effect !== null && half.resolve === null && half.castModal === null && half.kicker === null && !grouped;
        return plain && !(half.manaCost ?? "").includes("{X}") ? [] : [`${name}: not a plain half`];
      });
    });
    expect(wrong).toEqual([]);
    expect(POOL_CARDS.filter((def) => def.fuse && !wholes.includes(def)).map((d) => d.name)).toEqual([]);
  });
});

describe("classify", () => {
  it("isTokenCard is the tokens/ directory, not a name guess", () => {
    for (const def of TOKEN_CARDS) expect(isTokenCard(def), def.name).toBe(true);
    for (const def of POOL_CARDS) expect(isTokenCard(def), def.name).toBe(false);
  });

  it("a meld pair's combined back face names two pool cards and has no mana cost (rule 712.4)", () => {
    const names = new Set(POOL_CARDS.map((def) => def.name));
    for (const def of POOL_CARDS) {
      if (def.meldOf === null) continue;
      expect(def.manaCost, def.name).toBeNull();
      for (const front of def.meldOf) expect(names.has(front), `${def.name}: ${front}`).toBe(true);
    }
  });

  it("isCardFront picks the face a card is deck-listed under", () => {
    for (const def of POOL_CARDS) {
      if (def.prepareSpellOnly || def.meldOf !== null) {
        // A prepare spell that is no card of its own (rule 722.3c), or a
        // meld pair's combined back face (712.4b).
        expect(isCardFront(def), def.name).toBe(false);
      } else if (def.faces === null) {
        expect(isCardFront(def), def.name).toBe(true);
      } else {
        expect(isCardFront(def), def.name).toBe(def.faces[0] === def.name);
      }
    }
  });

  it("isDeckableCard excludes tokens and back faces", () => {
    const deckable = POOL_CARDS.concat(TOKEN_CARDS).filter(isDeckableCard);
    expect(deckable.some((d) => isTokenCard(d))).toBe(false);
    expect(deckable.some((d) => !isCardFront(d))).toBe(false);
    // Sanity: the overwhelming majority of the pool is still deckable, so a
    // predicate that accidentally rejected everything would fail here. A
    // proportion, not a fixed count: every double-faced card adds a back face.
    expect(deckable.length).toBeGreaterThan(POOL_CARDS.length * 0.9);
  });
});
